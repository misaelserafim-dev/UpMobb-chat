const MIC_DENIED_KEY = "upmobb.mic-denied";

export type MicAvailability = {
  ok: boolean;
  reason: string;
};

function readDeniedFlag() {
  try {
    return sessionStorage.getItem(MIC_DENIED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markMicDenied() {
  try {
    sessionStorage.setItem(MIC_DENIED_KEY, "1");
  } catch {
    // ignore
  }
}

export function clearMicDenied() {
  try {
    sessionStorage.removeItem(MIC_DENIED_KEY);
  } catch {
    // ignore
  }
}

export async function getMicAvailability(): Promise<MicAvailability> {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    return { ok: false, reason: "Áudio não suportado neste navegador" };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs = devices.filter((d) => d.kind === "audioinput");
    if (inputs.length === 0) {
      return { ok: false, reason: "Nenhum microfone encontrado" };
    }
  } catch {
    // ignore
  }

  try {
    const status = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    if (status.state === "denied") {
      markMicDenied();
      return { ok: false, reason: "Sem acesso ao microfone" };
    }
    if (status.state === "granted") {
      clearMicDenied();
    }
  } catch {
    // Safari / Firefox — Permissions API limitada
  }

  if (readDeniedFlag()) {
    return { ok: false, reason: "Sem acesso ao microfone" };
  }

  return { ok: true, reason: "" };
}

export async function watchMicAvailability(
  onChange: (availability: MicAvailability) => void,
): Promise<() => void> {
  let cancelled = false;
  let status: PermissionStatus | null = null;

  const emit = async () => {
    const availability = await getMicAvailability();
    if (!cancelled) onChange(availability);
  };

  await emit();

  const onDeviceChange = () => {
    void emit();
  };

  const onPermissionChange = () => {
    void emit();
  };

  navigator.mediaDevices?.addEventListener?.("devicechange", onDeviceChange);

  try {
    status = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    status.addEventListener("change", onPermissionChange);
  } catch {
    // ignore
  }

  return () => {
    cancelled = true;
    navigator.mediaDevices?.removeEventListener?.("devicechange", onDeviceChange);
    status?.removeEventListener("change", onPermissionChange);
  };
}
