import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Confirm ride (called by driver via email link)
  app.get("/api/driver/confirm-ride/:id", async (req, res) => {
    const { id } = req.params;
    const { driverId } = req.query;
    
    try {
      // 1. Check current status
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('status, driver_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (booking.status === 'Bestätigt') {
        return res.send(`
          <html>
            <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc;">
              <div style="background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px;">
                <div style="width: 64px; height: 64px; background: #ef4444; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 32px;">✕</div>
                <h1 style="color: #0f172a; margin: 0 0 16px;">Nicht mehr verfügbar</h1>
                <p style="color: #64748b; margin: 0 0 32px; line-height: 1.6;">Diese Fahrt wurde bereits von einem anderen Fahrer übernommen oder ist nicht mehr aktiv.</p>
                <p style="font-size: 14px; color: #94a3b8;">Vielen Dank für Ihr Interesse.</p>
              </div>
            </body>
          </html>
        `);
      }

      // 2. Update status and assign driver
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'Bestätigt',
          driver_id: driverId
        })
        .eq('id', id);

      if (updateError) throw updateError;

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc;">
            <div style="background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px;">
              <div style="width: 64px; height: 64px; background: #22c55e; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 32px;">✓</div>
              <h1 style="color: #0f172a; margin: 0 0 16px;">Fahrt bestätigt!</h1>
              <p style="color: #64748b; margin: 0 0 32px; line-height: 1.6;">Vielen Dank. Die Fahrt wurde erfolgreich bestätigt und Ihnen zugewiesen.</p>
              <p style="font-size: 14px; color: #94a3b8;">Sie können dieses Fenster jetzt schließen.</p>
            </div>
          </body>
        </html>
      `);
    } catch (err) {
      console.error("Confirmation error:", err);
      res.status(500).send("Fehler bei der Bestätigung der Fahrt.");
    }
  });

  // API Route: Send ride info to driver
  app.post("/api/admin/send-ride", async (req, res) => {
    const { driverEmail, driverId, rideInfo } = req.body;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const confirmUrl = `${appUrl}/api/driver/confirm-ride/${rideInfo.id}?driverId=${driverId}`;

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "RESEND_API_KEY is not configured" });
    }

    // Determine direction for header
    const isFromAirport = rideInfo.pickup.includes("Flughafen") || rideInfo.pickup.includes("VIE");
    const isToAirport = rideInfo.destination.includes("Flughafen") || rideInfo.destination.includes("VIE");
    let directionHeader = "FAHRT";
    if (isFromAirport) directionHeader = "VOM FLUGHAFEN";
    else if (isToAirport) directionHeader = "ZUM FLUGHAFEN";

    // Format addresses for email
    const formatAddress = (addr: string) => {
      if (addr.includes("Flughafen Wien") || addr.includes("VIE")) {
        return "VIE (Flughafen Wien)";
      }
      return addr;
    };

    const displayPickup = formatAddress(rideInfo.pickup);
    const displayDestination = formatAddress(rideInfo.destination);

    try {
      const { data, error } = await resend.emails.send({
        from: 'FlughafenTaxi <onboarding@resend.dev>',
        to: driverEmail,
        subject: 'Neue Fahrtzuweisung',
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #DA0A14; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Neue Fahrtzuweisung</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; margin-bottom: 24px;">Hallo,</p>
              <p style="font-size: 16px; margin-bottom: 24px;">Ihnen wurde eine neue Fahrt zugewiesen. Bitte bestätigen Sie die Übernahme der Fahrt durch Klick auf den Button unten:</p>
              
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${confirmUrl}" style="background-color: #22c55e; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Fahrt bestätigen</a>
              </div>

              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <div style="text-align: center; margin-bottom: 16px;">
                  <h2 style="margin: 0; font-size: 28px; color: #DA0A14; font-weight: 900; letter-spacing: 1px;">${directionHeader}</h2>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Datum:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${new Date(rideInfo.date).toLocaleDateString('de-DE')} um ${rideInfo.time} Uhr</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Abholung:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${displayPickup}</td>
                  </tr>
                  ${rideInfo.flight_number ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Flight number:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.flight_number}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Ziel:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${displayDestination}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Preis:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #DA0A14; font-size: 18px;">${rideInfo.price} € (${rideInfo.payment_method === 'CARD' ? 'Kreditkarte' : 'Barzahlung'})</td>
                  </tr>
                </table>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 24px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; font-size: 16px;">Fahrgast-Informationen</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Name:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.full_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Telefon:</td>
                    <td style="padding: 8px 0; font-weight: bold;"><a href="tel:${rideInfo.phone}" style="color: #2563eb; text-decoration: none;">${rideInfo.phone || 'N/A'}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Personen:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.passengers}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Gepäck:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.luggage_count} Koffer, ${rideInfo.hand_luggage} Handgepäck</td>
                  </tr>
                  ${(rideInfo.baby_seats > 0 || rideInfo.child_seats > 0 || rideInfo.booster_seats > 0) ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Kindersitze:</td>
                    <td style="padding: 8px 0; font-weight: bold;">
                      ${[
                        rideInfo.baby_seats > 0 ? `${rideInfo.baby_seats} Babyschale(n)` : null,
                        rideInfo.child_seats > 0 ? `${rideInfo.child_seats} Kindersitz(e)` : null,
                        rideInfo.booster_seats > 0 ? `${rideInfo.booster_seats} Sitzerhöhung(en)` : null
                      ].filter(Boolean).join(', ')}
                    </td>
                  </tr>` : ''}
                  ${rideInfo.flight_number ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Flugnummer:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.flight_number}</td>
                  </tr>` : ''}
                  ${rideInfo.notes ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Anmerkung:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.notes}</td>
                  </tr>` : ''}
                </table>
              </div>

              <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 32px;">Gute Fahrt!</p>
            </div>
          </div>
        `
      });

      if (error) {
        return res.status(400).json({ error });
      }

      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // API Route: Send confirmation email to passenger
  app.post("/api/passenger/send-confirmation", async (req, res) => {
    const { rideInfo } = req.body;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "RESEND_API_KEY is not configured" });
    }

    // Format addresses for email
    const formatAddress = (addr: string) => {
      if (addr.includes("Flughafen Wien") || addr.includes("VIE")) {
        return "VIE (Flughafen Wien)";
      }
      return addr;
    };

    const displayPickup = formatAddress(rideInfo.pickup);
    const displayDestination = formatAddress(rideInfo.destination);

    try {
      const { data, error } = await resend.emails.send({
        from: 'FlughafenTaxi <onboarding@resend.dev>',
        to: rideInfo.email,
        subject: 'Buchungsbestätigung - FlughafenTaxi',
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #DA0A14; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Buchungsbestätigung</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; margin-bottom: 24px;">Sehr geehrte(r) ${rideInfo.full_name},</p>
              <p style="font-size: 16px; margin-bottom: 24px;">vielen Dank für Ihre Buchung! Wir haben Ihre Anfrage erhalten und werden diese in Kürze bearbeiten.</p>
              
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Datum:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${new Date(rideInfo.date).toLocaleDateString('de-DE')} um ${rideInfo.time} Uhr</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Abholung:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${displayPickup}</td>
                  </tr>
                  ${rideInfo.flight_number ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Flight number:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.flight_number}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Ziel:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${displayDestination}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Preis:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #DA0A14; font-size: 18px;">${rideInfo.price} € (${rideInfo.payment_method === 'CARD' ? 'Kreditkarte' : 'Barzahlung'})</td>
                  </tr>
                </table>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 24px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; font-size: 16px;">Fahrgast-Informationen</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Name:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.full_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Telefon:</td>
                    <td style="padding: 8px 0; font-weight: bold;"><a href="tel:${rideInfo.phone}" style="color: #2563eb; text-decoration: none;">${rideInfo.phone || 'N/A'}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Personen:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.passengers}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Gepäck:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.luggage_count} Koffer, ${rideInfo.hand_luggage} Handgepäck</td>
                  </tr>
                  ${(rideInfo.baby_seats > 0 || rideInfo.child_seats > 0 || rideInfo.booster_seats > 0) ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Kindersitze:</td>
                    <td style="padding: 8px 0; font-weight: bold;">
                      ${[
                        rideInfo.baby_seats > 0 ? `${rideInfo.baby_seats} Babyschale(n)` : null,
                        rideInfo.child_seats > 0 ? `${rideInfo.child_seats} Kindersitz(e)` : null,
                        rideInfo.booster_seats > 0 ? `${rideInfo.booster_seats} Sitzerhöhung(en)` : null
                      ].filter(Boolean).join(', ')}
                    </td>
                  </tr>` : ''}
                  ${rideInfo.flight_number ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Flugnummer:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.flight_number}</td>
                  </tr>` : ''}
                  ${rideInfo.notes ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Anmerkung:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.notes}</td>
                  </tr>` : ''}
                </table>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 24px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; font-size: 16px;">Änderungen & Stornierungen</h3>
                
                <p style="font-size: 14px; margin-bottom: 8px;"><strong>• Für Fahrten bis 22:00 Uhr:</strong><br>
                Änderungen oder Stornierungen sind bis spätestens 3 Stunden vor Abholzeit möglich.</p>

                <p style="font-size: 14px; margin-bottom: 16px;"><strong>• Für Fahrten zwischen 22:00 und 07:00 Uhr:</strong><br>
                Änderungen oder Stornierungen sind mindestens 8 Stunden vor Abholzeit erforderlich.</p>

                <p style="font-size: 14px;">Weitere Details finden Sie hier:<br>
                👉 <a href="${appUrl}/faq" style="color: #DA0A14; text-decoration: none; font-weight: bold;">FAQ</a></p>
              </div>

              <div style="text-align: center; margin-top: 32px; margin-bottom: 24px;">
                <a href="https://wa.me/436601234567" style="background-color: #25D366; color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; font-size: 14px;">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="20" height="20" style="filter: brightness(0) invert(1);" alt="">
                  Questions? Start a WhatsApp chat with us
                </a>
              </div>

              <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 32px;">Sollten Sie Fragen haben, kontaktieren Sie uns bitte.</p>
            </div>
          </div>
        `
      });

      if (error) {
        return res.status(400).json({ error });
      }

      res.json({ success: true, data });
    } catch (err) {
      console.error("Passenger confirmation email error:", err);
      res.status(500).json({ error: "Failed to send confirmation email" });
    }
  });

  // API Route: Cancel ride (send emails to passenger and driver)
  app.post("/api/admin/cancel-ride", async (req, res) => {
    const { rideInfo, driverInfo } = req.body;
    
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "RESEND_API_KEY is not configured" });
    }

    try {
      const emails = [];

      // 1. Email to Passenger
      emails.push(resend.emails.send({
        from: 'FlughafenTaxi <onboarding@resend.dev>',
        to: rideInfo.email,
        subject: 'Ihre Buchung wurde storniert',
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #ef4444; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Buchung storniert</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; margin-bottom: 24px;">Sehr geehrte(r) ${rideInfo.full_name},</p>
              <p style="font-size: 16px; margin-bottom: 24px;">Ihre Buchung für den ${new Date(rideInfo.date).toLocaleDateString('de-DE')} um ${rideInfo.time} Uhr wurde storniert.</p>
              
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; font-size: 16px;">Details der stornierten Fahrt:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Abholung:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.pickup}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Ziel:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${rideInfo.destination}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 14px; color: #64748b;">Sollten Sie Fragen haben, kontaktieren Sie uns bitte.</p>
            </div>
          </div>
        `
      }));

      // 2. Email to Driver (if assigned)
      if (driverInfo && driverInfo.email) {
        emails.push(resend.emails.send({
          from: 'FlughafenTaxi <onboarding@resend.dev>',
          to: driverInfo.email,
          subject: 'Fahrt storniert',
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #ef4444; color: white; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Fahrt storniert</h1>
              </div>
              <div style="padding: 32px;">
                <p style="font-size: 16px; margin-bottom: 24px;">Hallo ${driverInfo.name},</p>
                <p style="font-size: 16px; margin-bottom: 24px;">Die Ihnen zugewiesene Fahrt am ${new Date(rideInfo.date).toLocaleDateString('de-DE')} um ${rideInfo.time} Uhr wurde storniert.</p>
                
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <h3 style="margin-top: 0; font-size: 16px;">Details:</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Fahrgast:</td>
                      <td style="padding: 8px 0; font-weight: bold;">${rideInfo.full_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Abholung:</td>
                      <td style="padding: 8px 0; font-weight: bold;">${rideInfo.pickup}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          `
        }));
      }

      await Promise.all(emails);
      res.json({ success: true });
    } catch (err) {
      console.error("Cancellation email error:", err);
      res.status(500).json({ error: "Failed to send cancellation emails" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
