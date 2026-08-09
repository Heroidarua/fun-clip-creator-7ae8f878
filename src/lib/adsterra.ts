/**
 * Configuração central da monetização Adsterra.
 * Ative/desative cada formato aqui — nenhum script é espalhado pelo projeto.
 */
export const ADSTERRA_CONFIG = {
  popunder: {
    enabled: true,
    src: "https://undergocutlery.com/ce/9f/a8/ce9fa89fa5d51adb96107d4eafe47857.js",
  },
  socialBar: {
    enabled: true,
    src: "https://undergocutlery.com/ae/0d/31/ae0d31b2adaec34d918bbe58f11842c2.js",
  },
  smartlink: {
    enabled: true,
    url: "https://undergocutlery.com/da5ha89ygg?key=252d138bf3526c0a798cee970db93534",
  },
} as const;

const injected = new Set<string>();

const injectScript = (src: string) => {
  if (typeof document === "undefined") return;
  if (injected.has(src)) return;
  if (document.querySelector(`script[data-adsterra][src="${src}"]`)) {
    injected.add(src);
    return;
  }
  injected.add(src);
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  script.setAttribute("data-adsterra", "true");
  document.body.appendChild(script);
};

export const loadAdsterraScripts = () => {
  if (ADSTERRA_CONFIG.popunder.enabled) injectScript(ADSTERRA_CONFIG.popunder.src);
  if (ADSTERRA_CONFIG.socialBar.enabled) injectScript(ADSTERRA_CONFIG.socialBar.src);
};
