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
 * File name:         create-service.command.ts
 * Last modified:     24/03/2021, 19:42
 ******************************************************************************/
import { execSync } from 'child_process';
import { ICommand } from '../../interfaces';
import { output } from '../../utils';
import * as path from 'path';

export class CreateServiceCommand implements ICommand {
  command = 'create [service-name] [actions...]';

  option: [string?, string?, string?] = [];

  description = 'create a new ultimate-backend service';

  action(serviceName, actions, options, command): void {
    console.log('serviceName => ', serviceName);
    try {
      execSync(`nx g @ultimate-backend/plugin-nx:service`, {
        stdio: [0, 1, 2],
      });
    } catch (e) {
      output.error({
        title: 'Error creating service',
        bodyLines: [e],
      });
    }
  }
}

export const serviceCommand = new CreateServiceCommand();