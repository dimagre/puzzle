import { Link, Text } from "@react-email/components";
import { EmailLayout, emailStyles, shortOrderId } from "./_layout";

export interface OrderShippedEmailProps {
  orderId: string;
  customerName: string;
  trackingNumber: string;
}

const NOVA_POSHTA_TRACKING_URL =
  "https://novaposhta.ua/tracking/?cargo_number=";

export function OrderShippedEmail({
  orderId,
  customerName,
  trackingNumber,
}: OrderShippedEmailProps) {
  const shortId = shortOrderId(orderId);
  return (
    <EmailLayout preview={`Замовлення #${shortId} відправлено`}>
      <Text style={emailStyles.heading}>
        Замовлення #{shortId} відправлено
      </Text>
      <Text style={emailStyles.paragraph}>Вітаємо, {customerName}!</Text>
      <Text style={emailStyles.paragraph}>
        Ваше замовлення вже в дорозі. Використовуйте номер нижче, щоб
        відстежити доставку.
      </Text>
      <Text style={emailStyles.highlight}>
        Номер для відстеження: <strong>{trackingNumber}</strong>
      </Text>
      <Text style={emailStyles.paragraph}>
        Перевірити статус посилки можна за посиланням:{" "}
        <Link
          href={`${NOVA_POSHTA_TRACKING_URL}${encodeURIComponent(
            trackingNumber,
          )}`}
        >
          відстежити на сайті перевізника
        </Link>
        .
      </Text>
      <Text style={emailStyles.paragraph}>
        Гарної гри!
        <br />
        Команда PuzzleShare
      </Text>
    </EmailLayout>
  );
}

export const orderShippedSubject = (orderId: string) =>
  `Замовлення #${shortOrderId(orderId)} відправлено`;

export default OrderShippedEmail;
