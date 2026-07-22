/**
 * Contatos oficiais da GEA — fonte única da verdade.
 * Alterar aqui reflete em todo o projeto (páginas legais, VIP, admin, metadados).
 */
export const CONTACT = {
  email: "geaoficial26@gmail.com",
  whatsappDisplay: "(16) 99346-4038",
  whatsappE164: "5516993464038",
} as const;

export const CONTACT_LINKS = {
  mailto: `mailto:${CONTACT.email}`,
  whatsapp: `https://wa.me/${CONTACT.whatsappE164}`,
} as const;
