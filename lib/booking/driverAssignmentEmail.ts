export type DriverAssignmentEmailInput = {
  confirmLink: string;
  passengerNameHtml: string;
  phoneHref: string;
  phoneHtml: string;
  pickupHtml: string;
  destinationHtml: string;
  pickupMapsLink: string;
  destinationMapsLink: string;
  pickupIsAirport: boolean;
  destinationIsAirport: boolean;
  dateHtml: string;
  timeHtml: string;
  vehicleHtml: string;
  passengersHtml: string;
  luggageHtml: string;
  handLuggageHtml: string;
  flightNumberHtml: string;
  notesHtml: string;
  hasNotes: boolean;
  childSeatInfoHtml: string;
  intermediateStopInfoHtml: string;
  hasAdditionalInfo: boolean;
  directionIcon: string;
  directionLabelHtml: string;
  priceHtml: string;
  paymentHtml: string;
  paymentStyle: string;
};

export function buildDriverAssignmentEmailHtml(input: DriverAssignmentEmailInput) {
  const pickupContent = input.pickupIsAirport
    ? input.pickupHtml
    : `<a href="${input.pickupMapsLink}" style="color:#0071e3;text-decoration:none;font-weight:600;" target="_blank" rel="noopener noreferrer">${input.pickupHtml}</a>`;
  const destinationContent = input.destinationIsAirport
    ? input.destinationHtml
    : `<a href="${input.destinationMapsLink}" style="color:#0071e3;text-decoration:none;font-weight:600;" target="_blank" rel="noopener noreferrer">${input.destinationHtml}</a>`;

  return `
    <div style="margin:0;padding:8px;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';color:#1d1d1f;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:none;margin:0;background:#ffffff;border:none;border-radius:24px;overflow:hidden;">
        <tr>
          <td style="padding:18px 10px 0 10px;text-align:center;">
            <a href="${input.confirmLink}" style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:12px 24px;border-radius:9999px;">Bestaetigen Sie die Fahrt hier</a>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 10px 8px 10px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff;border-radius:16px;">
              <tr><td colspan="2" style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#1679ff;font-weight:700;text-align:left;">Passagier</td></tr>
              <tr>
                <td style="width:50%;padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;"><strong>Name:</strong> ${input.passengerNameHtml}</td>
                <td style="width:50%;padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;"><strong>Telefon:</strong> <a href="tel:${input.phoneHref}" style="color:#0071e3;text-decoration:none;font-weight:600;">${input.phoneHtml}</a></td>
              </tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#ffffff;border-radius:16px;">
              <tr><td colspan="2" style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#1679ff;font-weight:700;text-align:left;">Fahrt</td></tr>
              <tr>
                <td style="width:50%;padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;"><strong>Abholung:</strong> ${pickupContent}</td>
                <td style="width:50%;padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;"><strong>Ziel:</strong> ${destinationContent}</td>
              </tr>
              <tr>
                <td style="width:50%;padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;"><strong>Datum:</strong> ${input.dateHtml}</td>
                <td style="width:50%;padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;"><strong>Uhrzeit:</strong> ${input.timeHtml}</td>
              </tr>
              <tr>
                <td style="width:50%;padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;"><strong>Fahrzeug:</strong> ${input.vehicleHtml}</td>
                <td style="width:50%;padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;"><strong>Personen:</strong> ${input.passengersHtml}</td>
              </tr>
              <tr>
                <td style="width:50%;padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;"><strong>Koffer:</strong> ${input.luggageHtml}</td>
                <td style="width:50%;padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;"><strong>Handgepäck:</strong> ${input.handLuggageHtml}</td>
              </tr>
              ${input.flightNumberHtml || input.hasNotes ? `
              <tr>
                <td style="width:50%;padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;">${input.flightNumberHtml ? `<strong>Flugnummer:</strong> ${input.flightNumberHtml}` : '&nbsp;'}</td>
                <td style="width:50%;padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;vertical-align:top;">${input.hasNotes ? `<strong>Notizen:</strong> ${input.notesHtml}` : '&nbsp;'}</td>
              </tr>
              ` : ''}
            </table>
            ${input.hasAdditionalInfo ? `
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
              <tr><td style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#86868b;font-weight:700;">Zusatzinformationen</td></tr>
              ${input.childSeatInfoHtml ? `<tr><td style="padding:0 18px 12px 18px;font-size:14px;color:#1d1d1f;"><strong>Kindersitze:</strong> ${input.childSeatInfoHtml}</td></tr>` : ''}
              ${input.intermediateStopInfoHtml ? `<tr><td style="padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;"><strong>Zwischenstopp:</strong> ${input.intermediateStopInfoHtml}</td></tr>` : ''}
            </table>
            ` : ''}
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#ffffff;border-radius:16px;">
              <tr>
                <td style="padding:12px 8px 12px 10px;text-align:center;width:44%;">
                  <div style="font-size:22px;line-height:1;margin-bottom:6px;">${input.directionIcon}</div>
                  <div style="font-size:14px;line-height:1;color:#8b8b90;margin-bottom:6px;">____</div>
                  <div style="font-size:13px;color:#1d1d1f;font-weight:700;line-height:1.2;">${input.directionLabelHtml}</div>
                </td>
                <td style="padding:12px 10px 12px 8px;text-align:center;width:56%;">
                  <div style="font-size:11px;letter-spacing:.08em;color:#86868b;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Gesamtpreis</div>
                  <div style="font-size:30px;line-height:1.05;color:#1d1d1f;font-weight:700;letter-spacing:-0.01em;">${input.priceHtml} &euro;</div>
                  <div style="margin-top:8px;font-size:12px;font-weight:700;color:#1d1d1f;">${input.paymentHtml}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}
