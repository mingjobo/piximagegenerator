export function respData(data: any) {
  return respJson(0, "ok", data || []);
}

export function respOk() {
  return respJson(0, "ok");
}

export function respErr(message: string, status?: number) {
  return respJson(-1, message, undefined, status);
}

export function respJson(
  code: number,
  message: string,
  data?: any,
  status?: number
) {
  let json = {
    code: code,
    message: message,
    data: data,
  };
  if (data) {
    json["data"] = data;
  }

  return Response.json(json, status ? { status } : undefined);
}
