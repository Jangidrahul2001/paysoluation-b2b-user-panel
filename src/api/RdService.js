// src/services/rdService.js

let methodCapture = "";
let methodInfo = "";

// 🔍 DEVICE DISCOVER
export const discoverDevice = async () => {
  let primaryUrl = "http://127.0.0.1:";
  let found = false;

  for (let i = 11100; i <= 11120; i++) {
    try {
      const res = await fetch(primaryUrl + i, {
        method: "RDSERVICE",
      });

      const data = await res.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "text/xml");

      const status = xml
        .getElementsByTagName("RDService")[0]
        ?.getAttribute("status");

      if (status === "READY" || status === "USED") {
        const interfaces = xml.getElementsByTagName("Interface");

        let capturePath = "";
        let infoPath = "";

        for (let intf of interfaces) {
          const path = intf.getAttribute("path");
          if (path.includes("capture")) capturePath = path;
          if (path.includes("info")) infoPath = path;
        }

        methodCapture = primaryUrl + i + capturePath;
        methodInfo = primaryUrl + i + infoPath;

        found = true;

        return {
          success: true,
          message: "Device Connected",
          info: data,
          captureUrl: methodCapture,
          infoUrl: methodInfo,
        };
      }
    } catch (err) {
      // ignore
    }
  }

  return {
    success: false,
    message: "Device not found",
  };
};

// 📟 DEVICE INFO
export const getDeviceInfo = async () => {
  if (!methodInfo) {
    return {
      success: false,
      message: "Device not connected",
    };
  }

  try {
    const res = await fetch(methodInfo, {
      method: "DEVICEINFO",
    });

    const data = await res.text();

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      message: "Device info error",
    };
  }
};

// 👆 FINGERPRINT CAPTURE
export const captureFingerprint = async (
  wadhValue = false,
  service = "default",
) => {
  const wadhValueAsPerService = {
    aeps1: "E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=",
    dmt: "18f4CEiXeXcfGXvgWA/blxD+w2pw7hfQPY45JMytkPw=",
    default: "E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=",
  };
  if (!methodCapture) {
    return {
      success: false,
      message: "Device not connected",
    };
  }

  const xml = `<?xml version="1.0"?>
  <PidOptions>
    <Opts fCount="1" fType="2" iCount="0" pCount="0"
    format="0" pidVer="2.0" timeout="10000"
    posh="UNKNOWN" env="P"
    wadh=${wadhValue ? `"${wadhValueAsPerService[service]}"` : `""`} />
  </PidOptions>`;

  try {
    const res = await fetch(methodCapture, {
      method: "CAPTURE",
      body: xml,
      headers: {
        "Content-Type": "text/xml",
      },
    });

    let pidXML = await res.text();

    // Clean XML
    pidXML = pidXML.replace(/\r?\n|\r/g, "").trim();
    pidXML = pidXML.replace(/>\s+</g, "><");

    // Parse XML
    const parser = new DOMParser();
    const parsed = parser.parseFromString(pidXML, "text/xml");

    const resp = parsed.getElementsByTagName("Resp")[0];
    const errCode = resp?.getAttribute("errCode");
    const msg = resp?.getAttribute("errInfo");

    if (errCode === "0") {
      return {
        success: true,
        message: "Capture Success",
        data: pidXML,
      };
    } else {
      return {
        success: false,
        message: msg || "Capture failed",
      };
    }
  } catch (err) {
    return {
      success: false,
      message: "Capture error",
    };
  }
};

export const convertToBase64 = (data) => {
  try {
    return btoa(data);
  } catch (error) {
    console.error("Base64 conversion error:", error);
    return null;
  }
};
