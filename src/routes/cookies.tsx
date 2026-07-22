import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/gea/LegalShell";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de Cookies — GEA" },
      {
        name: "description",
        content: "Categorias de cookies utilizadas pela GEA e como gerenciar suas preferências.",
      },
      { property: "og:title", content: "Política de Cookies — GEA" },
      {
        property: "og:description",
        content: "Entenda os cookies utilizados na experiência GEA e ajuste suas preferências.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const openPrefs = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gea:open-consent"));
    }
  };

  return (
    <LegalShell eyebrow="Documento legal" title="Política de Cookies" updated="14 de julho de 2026">
      <p>
        A GEA utiliza cookies e tecnologias semelhantes para operar o site, analisar o desempenho e
        personalizar sua experiência. Você controla o que pode ser ativado — cookies não essenciais
        só são carregados após seu consentimento explícito, em conformidade com a LGPD.
      </p>

      <h2>Categorias que utilizamos</h2>

      <h3>Essenciais</h3>
      <p>
        Necessários para o funcionamento básico: sessão do clube VIP, segurança, preferência de
        consentimento. Não podem ser desativados.
      </p>

      <h3>Desempenho</h3>
      <p>
        Métricas técnicas de carregamento, erros e estabilidade. Nenhum dado pessoal é vinculado.
      </p>

      <h3>Análise</h3>
      <p>
        Ferramentas como <strong>Google Analytics</strong> e <strong>Plausible</strong> para
        entender de forma agregada quais páginas convertem e como a comunidade navega. Dados
        anonimizados.
      </p>

      <h3>Marketing</h3>
      <p>
        <strong>Meta Pixel</strong>, <strong>TikTok Pixel</strong> e integrações futuras para
        mensurar campanhas, criar audiências personalizadas e otimizar anúncios.
      </p>

      <h2>Gerenciar preferências</h2>
      <p>Você pode revisar ou alterar sua decisão a qualquer momento:</p>
      <p>
        <button
          type="button"
          onClick={openPrefs}
          className="mt-2 rounded-[2px] border border-[#c9c9c9]/30 px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.32em] text-[#e0e0e0] transition-all hover:border-[#c9c9c9]/60 hover:text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Abrir preferências de cookies
        </button>
      </p>

      <h2>Cookies de terceiros</h2>
      <p>
        Alguns cookies são definidos por serviços externos que a GEA utiliza. Consulte as políticas
        próprias dessas plataformas para saber mais: Google, Meta, TikTok, Instagram.
      </p>
    </LegalShell>
  );
}
