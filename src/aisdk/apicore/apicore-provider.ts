import { ApicoreImageModel } from "./apicore-image-model";
import { ApicoreImageSettings } from "./apicore-image-settings";
import { loadSetting } from "@ai-sdk/provider-utils";
import type { FetchFunction } from "@ai-sdk/provider-utils";

export interface ApicoreProviderSettings {
  apiKey?: string;
  baseURL?: string;
  headers?: Record<string, string>;
  fetch?: FetchFunction;
}

export interface ApicoreProvider {
  image(modelId: string, settings?: ApicoreImageSettings): ApicoreImageModel;
}

export function createApicore(options: ApicoreProviderSettings = {}): ApicoreProvider {
  const loadApiKey = () =>
    loadSetting({
      settingValue: options.apiKey,
      settingName: "apiKey",
      environmentVariableName: "APICORE_API_KEY",
      description: "APICore API key",
    });

  return {
    image: (modelId: string, settings?: ApicoreImageSettings) => {
      return new ApicoreImageModel(modelId, settings ?? {}, {
        apiKey: loadApiKey(),
        provider: "apicore",
        baseURL: options.baseURL ?? "https://api.apicore.ai/v1",
        headers: options.headers,
        fetch: options.fetch,
      });
    },
  };
}

// 导出默认实例
export const apicore = createApicore();