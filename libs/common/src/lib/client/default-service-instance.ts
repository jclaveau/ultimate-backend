import { ServiceInstance } from './service-instance';
import { ServiceInstanceOptions } from './service-instance.options';
import { PlainObject } from '../utils';
import { ServiceInstanceState } from '../health';

export class DefaultServiceInstance implements ServiceInstance {
  state: ServiceInstanceState;

  constructor(private opts: ServiceInstanceOptions) {
    this.state = opts.state || new ServiceInstanceState();
  }

  getState(): ServiceInstanceState {
    return this.state;
  }

  getInstanceId(): string {
    return this.opts.instanceId;
  }

  getServiceId(): string {
    return this.opts.serviceId;
  }

  getHost(): string {
    return this.opts.host;
  }

  getPort(): number {
    return this.opts.port;
  }

  getTags(): string[] {
    return this.opts.tags || [];
  }

  getStatus(): string {
    return this.opts.status;
  }

  getNodeID(): string {
    return this.opts.nodeID;
  }

  isSecure(): boolean {
    return this.opts.secure;
  }

  getUri(): string {
    const scheme = this.getScheme();

    return `${scheme}://${this.getHost()}:${this.getPort()}`;
  }

  getScheme(): string {
    return this.isSecure() ? 'https' : 'http';
  }

  getMetadata(): PlainObject {
    return this.opts.metadata || new Map();
  }
}