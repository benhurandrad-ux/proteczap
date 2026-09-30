/* ProtecZap · configuração do front (estático, sem build).
   Preencha SUPABASE_URL e SUPABASE_ANON_KEY depois de criar o projeto no Supabase
   (Project Settings › API). A anon key é pública por desenho: toda proteção está na RLS. */
window.PZ = {
  SUPABASE_URL: "https://emfsrprsjwnhbelzzdfp.supabase.co",        // ex.: "https://abcdefghijklmnop.supabase.co"
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnNycHJzanduaGJlbHp6ZGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NTc5OTgsImV4cCI6MjEwNjEzMzk5OH0.Lav3N7oeAYGIh68uXnWBLkZoGxlgsJSmg0F7oWSTmAo",   // ex.: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."

  PLATFORM_NAME: "ProtecZap",
  ROOT_DOMAIN: "proteczap.com.br",   // empresa.proteczap.com.br resolve o tenant pelo host
  PLATFORM_COLOR: "#2B2B29",         // marca neutra da plataforma (login do super admin e host desconhecido)
  SUPPORT_WHATSAPP: "5511951751968", // WhatsApp da Atria, usado nos avisos de limite de plano

  /* FALLBACK antes do domínio existir (GitHub Pages, benhurandrade.com.br, localhost):
     se o host não for subdomínio de ROOT_DOMAIN, a empresa vem de ?empresa=slug na URL
     e fica guardada em localStorage (chave pz_empresa). Sem nada disso, a tela mostra a
     marca da plataforma e o login segue normalmente. */
  FALLBACK_QUERY_PARAM: "empresa",
  VERSION: "1"
};
