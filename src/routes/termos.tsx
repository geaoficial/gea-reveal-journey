import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/gea/LegalShell";
import { CONTACT, CONTACT_LINKS } from "@/lib/contact";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — GEA" },
      {
        name: "description",
        content:
          "Termos que regem o uso da experiência digital GEA e do clube exclusivo.",
      },
      { property: "og:title", content: "Termos de Uso — GEA" },
      {
        property: "og:description",
        content:
          "Regras de uso do site e do clube exclusivo GEA.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalShell
      eyebrow="Documento legal"
      title="Termos de Uso"
      updated="14 de julho de 2026"
    >
      <p>
        Ao acessar e utilizar o site da <strong>GEA</strong>, você concorda com
        estes Termos de Uso. Leia com atenção — eles regulam sua relação com a
        marca no ambiente digital.
      </p>

      <h2>1. Objeto</h2>
      <p>
        A GEA disponibiliza esta experiência digital para apresentar a marca,
        divulgar lançamentos e gerenciar o clube exclusivo de membros.
      </p>

      <h2>2. Cadastro no clube</h2>
      <ul>
        <li>É gratuito e voluntário.</li>
        <li>
          Você deve fornecer informações verdadeiras (nome, @ do Instagram).
        </li>
        <li>
          Contas com informações falsas podem ser suspensas sem aviso prévio.
        </li>
        <li>
          O cartão de membro e os benefícios são pessoais e intransferíveis.
        </li>
      </ul>

      <h2>3. Uso permitido</h2>
      <p>Você concorda em não:</p>
      <ul>
        <li>Usar o site para fins ilícitos ou ofensivos.</li>
        <li>Tentar burlar sistemas de segurança ou raspar dados em massa.</li>
        <li>Reproduzir conteúdos autorais sem autorização.</li>
      </ul>

      <h2>4. Propriedade intelectual</h2>
      <p>
        Todo o conteúdo — textos, fotografias, marca, identidade visual, código
        e design — é de propriedade exclusiva da GEA e protegido pela Lei de
        Direitos Autorais e pela Lei da Propriedade Industrial.
      </p>

      <h2>5. Benefícios do clube</h2>
      <p>
        Cupons, descontos e benefícios exibidos no cartão de membro são
        promocionais e podem ser alterados ou encerrados a qualquer momento. A
        aplicação de descontos exige o número do cartão ativo.
      </p>

      <h2>6. Limitação de responsabilidade</h2>
      <p>
        A GEA envida esforços para manter o site disponível e seguro, mas não se
        responsabiliza por interrupções pontuais, indisponibilidade de serviços
        de terceiros ou uso indevido de credenciais pelo próprio usuário.
      </p>

      <h2>7. Alterações</h2>
      <p>
        Estes termos podem ser atualizados. A versão vigente estará sempre
        publicada nesta página com a data da última revisão.
      </p>

      <h2>8. Foro</h2>
      <p>
        Fica eleito o foro da comarca do domicílio do consumidor para dirimir
        eventuais controvérsias, conforme o Código de Defesa do Consumidor.
      </p>

      <h2>9. Contato</h2>
      <p>
        E-mail: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        <br />
        WhatsApp:{" "}
        <a href={CONTACT_LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
          {CONTACT.whatsappDisplay}
        </a>
      </p>
    </LegalShell>
  );
}
