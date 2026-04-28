type EmailFeatureCard = {
  title: string;
  body: string;
};

type EmailInfoRow = {
  label: string;
  value: string;
};

type EmailLayoutInput = {
  eyebrow: string;
  title: string;
  subtitle: string;
  featureCards?: EmailFeatureCard[];
  infoTitle?: string;
  infoRows?: EmailInfoRow[];
  contentHtml?: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerHtml?: string;
};

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeHtmlWithLineBreaks(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, '<br/>');
}

function renderFeatureCards(cards: EmailFeatureCard[]) {
  if (!cards.length) return '';

  const rendered = cards
    .map(
      (card) => `
        <td style="width:50%;padding:0 8px 16px 8px;vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff;border-radius:20px;">
            <tr>
              <td style="padding:18px 18px 18px 18px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:44px;vertical-align:top;">
                      <div style="width:44px;height:44px;border-radius:999px;background:#edf4ff;color:#1679ff;font-size:26px;line-height:44px;text-align:center;font-weight:700;">✓</div>
                    </td>
                    <td style="padding-left:14px;">
                      <div style="font-size:16px;line-height:1.35;font-weight:700;color:#111827;margin-bottom:6px;">${escapeHtml(card.title)}</div>
                      <div style="font-size:14px;line-height:1.7;color:#5f6f82;">${escapeHtml(card.body)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      `,
    )
    .join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:24px;">
      <tr>
        ${rendered}
      </tr>
    </table>
  `;
}

function renderInfoRows(title: string, rows: EmailInfoRow[]) {
  if (!rows.length) return '';

  const renderedRows = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:0 22px 12px 22px;font-size:14px;line-height:1.7;color:#111827;text-align:center;">
            <strong>${escapeHtml(row.label)}:</strong> ${escapeHtmlWithLineBreaks(row.value)}
          </td>
        </tr>
      `,
    )
    .join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:10px;background:#ffffff;border-radius:22px;">
      <tr>
        <td style="padding:20px 22px 10px 22px;text-align:center;">
          <div style="display:inline-block;text-align:center;width:100%;max-width:320px;">
            <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#1679ff;font-weight:700;text-align:center;padding-bottom:14px;">
              ${escapeHtml(title)}
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              ${renderedRows}
            </table>
          </div>
        </td>
      </tr>
    </table>
  `;
}

function renderCta(label?: string, href?: string) {
  if (!label || !href) return '';

  return `
    <div style="margin-top:26px;text-align:center;">
      <a href="${escapeHtml(href)}" style="display:inline-block;max-width:100%;background:#000000;color:#ffffff;text-decoration:none;font-size:17px;line-height:1.2;font-weight:500;padding:18px 34px;border-radius:18px;font-family:'Instrument Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;">
        ${escapeHtml(label)}
      </a>
    </div>
  `;
}

export function buildEmailLayout(input: EmailLayoutInput) {
  const featureCards = input.featureCards || [];
  const infoRows = input.infoRows || [];

  return `
    <div style="margin:0;padding:34px 18px;background:#f7f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:1180px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;">
        <tr>
          <td style="padding:40px 28px 42px 28px;">
            <div style="max-width:860px;margin:0 auto;text-align:center;">
              <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#5f6f82;font-weight:700;margin-bottom:14px;">
                Alex Flughafentaxi
              </div>
              <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#1679ff;font-weight:700;">
                ${escapeHtml(input.eyebrow)}
              </div>
              <h1 style="margin:18px 0 16px 0;font-size:34px;line-height:1.15;font-weight:700;color:#111827;">
                ${escapeHtml(input.title)}
              </h1>
              <p style="margin:0 auto;max-width:820px;font-size:16px;line-height:1.75;color:#5f6f82;">
                ${escapeHtml(input.subtitle)}
              </p>
            </div>
            ${renderFeatureCards(featureCards)}
            ${input.contentHtml || ''}
            ${renderInfoRows(input.infoTitle || 'Details', infoRows)}
            ${renderCta(input.ctaLabel, input.ctaHref)}
            ${input.footerHtml || ''}
          </td>
        </tr>
      </table>
    </div>
  `;
}
