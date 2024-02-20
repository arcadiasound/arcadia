import { Env } from '../../types';
import { getAccount } from './api';

export const account = {
  init(env: Env) {
    return {
      get(address: string) {
        return getAccount(address, env);
      },
    };
  },
};
