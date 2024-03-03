/**
 * Create service config by current env
 *
 * @param env The current env
 */
export function createServiceConfig(env: Env.ImportMeta) {
  // const mockURL = 'https://mock.apifox.com/m1/3109515-0-default';
  // const mockURL = 'https://mock.apifox.com/m1/4045953-0-default';
  // const mockURL = 'http://82.157.140.187:3003/playlet/v1';
  const mockURL = 'http://118.31.170.88/playlet/v1';

  const serviceConfigMap: App.Service.ServiceConfigMap = {
    dev: {
      baseURL: mockURL,
      otherBaseURL: {
        demo: 'http://localhost:9528'
      }
    },
    test: {
      baseURL: mockURL,
      otherBaseURL: {
        demo: 'http://localhost:9529'
      }
    },
    prod: {
      baseURL: mockURL,
      otherBaseURL: {
        demo: 'http://localhost:9530'
      }
    }
  };

  const { VITE_SERVICE_ENV = 'dev' } = env;

  return serviceConfigMap[VITE_SERVICE_ENV];
}

/**
 * Get proxy pattern of service url
 *
 * @param key If not set, will use the default key
 */
export function createProxyPattern(key?: App.Service.OtherBaseURLKey) {
  if (!key) {
    return '/proxy-default';
  }

  return `/proxy-${key}`;
}
