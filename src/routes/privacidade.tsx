import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/gea/LegalShell";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — GEA" },
      {
        name: "description",
        content:
          "Como a GEA coleta, usa e protege dados pessoais, em conformidade com a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade — GEA" },
      {
        property: "og:description",
        content:
          "Transparência total sobre o tratamento de dados na experiência GEA.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Documento legal"
      title="Política de Privacidade"
      updated="14 de julho de 2026"
    >
      <p>
        Esta política descreve como a <strong>GEA</strong> ("nós") coleta, usa,
        armazena e protege dados pessoais dos visitantes e membros do clube. Ao
        navegar por esta experiência, você concorda com as práticas descritas
        abaixo, em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>.
      </p>

      <h2>1. Dados que coletamos</h2>
      <ul>
        <li>
          <strong>Cadastro no clube VIP:</strong> nome completo, @ do Instagram,
          cidade (opcional) e código de acesso.
        </li>
        <li>
          <strong>Uso do site:</strong> páginas visitadas, tempo de sessão,
          origem do tráfego e interações com CTAs (via ferramentas de análise).
        </li>
        <li>
          <strong>Dispositivo:</strong> tipo de navegador, sistema operacional e
          resolução, para otimizar a experiência.
        </li>
      </ul>

      <h2>2. Como usamos seus dados</h2>
      <ul>
        <li>Personalizar a experiência do clube e emitir seu cartão de membro.</li>
        <li>Comunicar lançamentos, benefícios exclusivos e novidades da marca.</li>
        <li>Analisar desempenho da comunicação e otimizar campanhas.</li>
        <li>Cumprir obrigações legais e prevenir fraudes.</li>
      </ul>

      <h2>3. Base legal</h2>
      <p>
        Tratamos seus dados com base no <em>consentimento</em>, na{" "}
        <em>execução de contrato</em> (participação no clube) e no{" "}
        <em>legítimo interesse</em> para segurança e melhoria da experiência.
      </p>

      <h2>4. Compartilhamento</h2>
      <p>
        Não vendemos dados pessoais. Compartilhamos apenas com operadores
        contratados (analytics, hospedagem, e-mail) sujeitos a acordos de
        confidencialidade e à LGPD.
      </p>

      <h2>5. Seus direitos</h2>
      <p>
        Você pode a qualquer momento solicitar acesso, correção, portabilidade,
        anonimização ou exclusão dos seus dados, além de revogar o consentimento.
        Envie sua solicitação para{" "}
        <a href="mailto:privacidade@gea.com.br">privacidade@gea.com.br</a>.
      </p>

      <h2>6. Segurança</h2>
      <p>
        Aplicamos criptografia em trânsito (HTTPS), controle de acesso por
        função, sessões assinadas com HMAC e políticas de RLS no banco de dados
        para restringir acesso a dados pessoais apenas ao necessário.
      </p>

      <h2>7. Retenção</h2>
      <p>
        Dados de membros VIP são mantidos enquanto o cadastro estiver ativo.
        Dados analíticos agregados são retidos por até 24 meses. Após esse
        período, dados pessoais são anonimizados ou excluídos.
      </p>

      <h2>8. Contato do Encarregado (DPO)</h2>
      <p>
        <a href="mailto:dpo@gea.com.br">dpo@gea.com.br</a>
      </p>
    </LegalShell>
  );
}
