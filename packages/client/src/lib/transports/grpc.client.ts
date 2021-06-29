/*******************************************************************************
 * Copyright (c) 2021. Rex Isaac Raphael
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * File name:         grpc.client.ts
 * Last modified:     19/03/2021, 00:26
 ******************************************************************************/
import { LoadBalancerClient } from '@ultimate-backend/loadbalancer';
import { IGrpcServiceClient } from '../interface';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { ServiceInstance } from '@ultimate-backend/common';
import { Observable } from 'rxjs';

export class GrpcClient {
  private readonly proxy: ClientGrpcProxy;
  private readonly proxyCache = new Map<string, ClientGrpcProxy>();
  private readonly serviceCache = new Map<string, any>();

  constructor(
    private readonly lb: LoadBalancerClient,
    private readonly options: IGrpcServiceClient
  ) {
    this.proxy = new ClientGrpcProxy(options);
  }

  getService<T extends {}>(name: string): T {
    const noClusterService = this.proxy.getService<T>(name);

    const grpcService = {} as T;
    const protoMethods = Object.keys(noClusterService);

    protoMethods.forEach((key) => {
      grpcService[key] = (...args: any[]) => {
        // eslint-disable-next-line prefer-const
        let { service, node } = this.getProxyService<T>(name, key);
        if (!service) {
          service = noClusterService;
          return service[key](...args);
        }

        if (this.options.hooks && this.options.hooks.preRequest) {
          this.options.hooks.preRequest(key, node);
        }

        const observable = service[key](...args);
        const req = this.lb.executeGrpc<Observable<any>>(key, node, observable);
        if (this.options.hooks && this.options.hooks.postRequest) {
          this.options.hooks.postRequest(req);
        }

        return req;
      };
    });

    return grpcService;
  }

  private getProxyService<T extends {}>(
    name: string,
    method: string
  ): { service: T; node: ServiceInstance } {
    let url, methodKey;
    let instanceId;
    let node: ServiceInstance;
    try {
      node = this.lb.choose(this.options.service);
      methodKey = `${node.getInstanceId()}/${method}`;
      instanceId = node.getInstanceId();
      url = `${node.getHost()}:${node.getPort()}`;
    } catch (e) {
      if (this.options.url) {
        methodKey = `${this.options.url}/${method}`;
        instanceId = this.options.url;
        url = this.options.url;
      } else {
        throw e;
      }
    }

    if (!this.serviceCache.get(methodKey)) {
      if (!this.proxyCache.has(instanceId)) {
        const proxy = new ClientGrpcProxy({
          url,
          package: this.options.package,
          protoPath: this.options.protoPath,
        });
        this.proxyCache.set(instanceId, proxy);
      }
      const proxy = this.proxyCache.get(instanceId);
      const service = proxy.getService<T>(name);
      this.serviceCache.set(methodKey, service);
    }

    const service = this.serviceCache.get(methodKey) as T;

    return { service, node };
  }
}