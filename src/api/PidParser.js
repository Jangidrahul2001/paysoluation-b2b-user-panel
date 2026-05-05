export const parseAndBuildPidData = (pidXmlResponse) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(pidXmlResponse, "text/xml");

    // Extract elements
    const resp = xmlDoc.querySelector("Resp");
    const deviceInfo = xmlDoc.querySelector("DeviceInfo");
    const skey = xmlDoc.querySelector("Skey");
    const hmac = xmlDoc.querySelector("Hmac");
    const data = xmlDoc.querySelector("Data");

    // 🔹 additional_info Params
    let srno = "",
      sysid = "",
      ts = "";
    // modality_type = "",
    // device_type = "";

    const paramNodes = xmlDoc.getElementsByTagName("Param"); // Changed from 'doc' to 'xmlDoc'

    for (let i = 0; i < paramNodes.length; i++) {
      const name = paramNodes[i].getAttribute("name");
      const value = paramNodes[i].getAttribute("value");

      if (name === "srno") srno = value;
      else if (name === "sysid") sysid = value;
      else if (name === "ts") ts = value;
      // else if (name === "modality_type") modality_type = value;
      // else if (name === "device_type") device_type = value;
    }

    let biometricData = {
      // Device Info - only use defaults if element/attribute doesn't exist
      dc: deviceInfo?.getAttribute("dc") || "",
      dpId: deviceInfo?.getAttribute("dpId") || "",
      mc: deviceInfo?.getAttribute("mc") || "",
      mi: deviceInfo?.getAttribute("mi") || "",
      rdsId: deviceInfo?.getAttribute("rdsId") || "",
      rdsVer: deviceInfo?.getAttribute("rdsVer") || "",

      // Security Keys
      ci: skey?.getAttribute("ci") || "",
      sessionKey: skey?.textContent?.trim() || "",
      hmac: hmac?.textContent?.trim() || "",

      // PID Data
      pidData: data?.textContent?.trim() || "",
      pidDataType: data?.getAttribute("type") || "X",

      // Response Info
      errCode: resp?.getAttribute("errCode") || "",
      errInfo: resp?.getAttribute("errInfo") || "",

      // Capture Info
      fCount: resp?.getAttribute("fCount") || "1",
      fType: resp?.getAttribute("fType") || "2",
      iCount: resp?.getAttribute("iCount") || "0",
      iType: resp?.getAttribute("iType") || "0",
      pCount: resp?.getAttribute("pCount") || "0",
      pType: resp?.getAttribute("pType") || "0",

      // Quality Info
      qScore: resp?.getAttribute("qScore") || "",
      nmPoints: resp?.getAttribute("nmPoints") || "",

      // System Info (from DeviceInfo attributes)
      srno: deviceInfo?.getAttribute("srno") || "",
      sysid: deviceInfo?.getAttribute("sysid") || "",

      // Timestamp
      ts: new Date().toISOString(),

      // Additional info
      ...(srno && { srno }),
      ...(sysid && { sysid }),
      ...(ts && { ts }),
      // ...(modality_type && { modality_type }),
      // ...(device_type && { device_type }),
    };

    return { data: biometricData, success: true };
  } catch (error) {
    console.error("Error parsing PID data:", error);
    return { data: null, success: false };
  }
};
