// ─── HTML Email Templates for TrademarkING ───

import type { SimilarMark } from "./mock-data";

export function exportReportEmail(data: {
  results: SimilarMark[];
  format: string;
  searchDate: string;
}) {
  const rows = data.results
    .map(
      (r, i) => `
      <tr style="border-bottom:1px solid #e2e6ef;">
        <td style="padding:10px 8px;color:#333;font-size:13px;text-align:center;">${i + 1}</td>
        <td style="padding:10px 8px;text-align:center;">
          <img src="${r.imageUrl}" alt="${r.name}" style="width:48px;height:48px;object-fit:contain;border-radius:4px;border:1px solid #e2e6ef;" />
        </td>
        <td style="padding:10px 8px;color:#333;font-size:13px;">${r.name}</td>
        <td style="padding:10px 8px;color:#333;font-size:13px;">${r.trademarkId}</td>
        <td style="padding:10px 8px;text-align:center;">
          <span style="display:inline-block;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600;color:#fff;background-color:${r.similarity >= 70 ? '#dc2626' : r.similarity >= 40 ? '#d97706' : '#16a34a'};">${r.similarity}%</span>
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="700" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background-color:#1a2b5f;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">TrademarkING</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1a2b5f;font-size:20px;">Image Search Report</h2>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
              Here are the similarity results from your trademark image search conducted on <strong>${data.searchDate}</strong>.
            </p>

            <table role="presentation" width="100%" style="background:#f8f9fc;border-radius:6px;border:1px solid #e2e6ef;margin-bottom:24px;">
              <tr><td style="padding:12px 20px;">
                <table role="presentation" width="100%">
                  <tr>
                    <td style="color:#888;font-size:13px;width:140px;">Total Results</td>
                    <td style="color:#1a2b5f;font-size:14px;font-weight:600;">${data.results.length}</td>
                  </tr>
                  <tr>
                    <td style="padding-top:6px;color:#888;font-size:13px;">Report Format</td>
                    <td style="padding-top:6px;color:#333;font-size:14px;">${data.format}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Results Table -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e6ef;border-radius:6px;overflow:hidden;margin-bottom:24px;">
              <tr style="background-color:#1a2b5f;">
                <th style="padding:10px 8px;color:#fff;font-size:12px;font-weight:600;text-align:center;">#</th>
                <th style="padding:10px 8px;color:#fff;font-size:12px;font-weight:600;text-align:center;">Image</th>
                <th style="padding:10px 8px;color:#fff;font-size:12px;font-weight:600;text-align:left;">Name</th>
                <th style="padding:10px 8px;color:#fff;font-size:12px;font-weight:600;text-align:left;">Trademark ID</th>
                <th style="padding:10px 8px;color:#fff;font-size:12px;font-weight:600;text-align:center;">Similarity</th>
              </tr>
              ${rows}
            </table>

            <p style="margin:0;color:#555;font-size:13px;line-height:1.6;">
              This report was generated automatically. For detailed analysis, please visit the TrademarkING portal.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f8f9fc;padding:24px 40px;border-top:1px solid #e2e6ef;text-align:center;">
            <p style="margin:0 0 4px;color:#999;font-size:12px;">This is an automated message from TrademarkING.</p>
            <p style="margin:0;color:#999;font-size:12px;">Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function applicationSubmittedEmail(data: {
  applicantName: string;
  businessName: string;
  applicationId: string;
  category: string;
  email: string;
  submissionDate: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background-color:#1a2b5f;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">TrademarkING</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1a2b5f;font-size:20px;">Application Submitted Successfully</h2>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
              Dear <strong>${data.applicantName}</strong>, your trademark application has been received and is now under review.
            </p>

            <!-- Details Card -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc;border-radius:6px;border:1px solid #e2e6ef;margin-bottom:24px;">
              <tr>
                <td style="padding:20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Application ID</td>
                      <td style="padding:6px 0;color:#1a2b5f;font-size:14px;font-weight:600;">${data.applicationId}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;">Business Name</td>
                      <td style="padding:6px 0;color:#333;font-size:14px;">${data.businessName}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;">Category</td>
                      <td style="padding:6px 0;color:#333;font-size:14px;">${data.category}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;">Submitted On</td>
                      <td style="padding:6px 0;color:#333;font-size:14px;">${data.submissionDate}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;">Email</td>
                      <td style="padding:6px 0;color:#333;font-size:14px;">${data.email}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
              You can track the status of your application anytime using your Application ID and registered email address on our portal.
            </p>

            <!-- CTA Button -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background-color:#1a2b5f;border-radius:6px;">
                  <a href="{{TRACK_URL}}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                    Track Application
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f8f9fc;padding:24px 40px;border-top:1px solid #e2e6ef;text-align:center;">
            <p style="margin:0 0 4px;color:#999;font-size:12px;">This is an automated message from TrademarkING.</p>
            <p style="margin:0;color:#999;font-size:12px;">Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function statusChangedEmail(data: {
  applicantName: string;
  businessName: string;
  applicationId: string;
  oldStatus: string;
  newStatus: string;
  agentNotes?: string;
  changedDate: string;
}) {
  const statusColor = data.newStatus === "approved" ? "#16a34a" : data.newStatus === "rejected" ? "#dc2626" : "#d97706";
  const statusLabel = data.newStatus.charAt(0).toUpperCase() + data.newStatus.slice(1);

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background-color:#1a2b5f;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">TrademarkING</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1a2b5f;font-size:20px;">Application Status Updated</h2>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
              Dear <strong>${data.applicantName}</strong>, the status of your trademark application has been updated.
            </p>

            <!-- Status Badge -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <span style="display:inline-block;padding:10px 28px;background-color:${statusColor};color:#ffffff;font-size:16px;font-weight:700;border-radius:6px;letter-spacing:0.5px;">
                    ${statusLabel}
                  </span>
                </td>
              </tr>
            </table>

            <!-- Details Card -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc;border-radius:6px;border:1px solid #e2e6ef;margin-bottom:24px;">
              <tr>
                <td style="padding:20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Application ID</td>
                      <td style="padding:6px 0;color:#1a2b5f;font-size:14px;font-weight:600;">${data.applicationId}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;">Business Name</td>
                      <td style="padding:6px 0;color:#333;font-size:14px;">${data.businessName}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;">Updated On</td>
                      <td style="padding:6px 0;color:#333;font-size:14px;">${data.changedDate}</td>
                    </tr>
                    ${data.agentNotes ? `
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;vertical-align:top;">Remarks</td>
                      <td style="padding:6px 0;color:#333;font-size:14px;line-height:1.5;">${data.agentNotes}</td>
                    </tr>` : ""}
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
              You can view more details by tracking your application on our portal.
            </p>

            <!-- CTA Button -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background-color:#1a2b5f;border-radius:6px;">
                  <a href="{{TRACK_URL}}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                    Track Application
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f8f9fc;padding:24px 40px;border-top:1px solid #e2e6ef;text-align:center;">
            <p style="margin:0 0 4px;color:#999;font-size:12px;">This is an automated message from TrademarkING.</p>
            <p style="margin:0;color:#999;font-size:12px;">Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
