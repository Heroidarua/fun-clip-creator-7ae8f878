/**
 * Configuração central da monetização Adsterra.
 * Ative/desative cada formato aqui — nenhum script é espalhado pelo projeto.
 */
export const ADSTERRA_CONFIG = {
  popunder: {
    enabled: true,
    featureKey: "ads_popunder",
    src: "https://undergocutlery.com/ce/9f/a8/ce9fa89fa5d51adb96107d4eafe47857.js",
  },
  socialBar: {
    enabled: true,
    featureKey: "ads_socialbar",
    src: "https://undergocutlery.com/ae/0d/31/ae0d31b2adaec34d918bbe58f11842c2.js",
  },
  smartlink: {
    enabled: true,
    featureKey: "ads_smartlink",
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

/** `isActive` vem do painel de ADM (tabela de status de recursos). */
export const loadAdsterraScripts = (isActive?: (key: string) => boolean) => {
  const allowed = (key: string) => (isActive ? isActive(key) : true);
  if (ADSTERRA_CONFIG.popunder.enabled && allowed(ADSTERRA_CONFIG.popunder.featureKey)) {
    injectScript(ADSTERRA_CONFIG.popunder.src);
  }
  if (ADSTERRA_CONFIG.socialBar.enabled && allowed(ADSTERRA_CONFIG.socialBar.featureKey)) {
    injectScript(ADSTERRA_CONFIG.socialBar.src);
  }
};
