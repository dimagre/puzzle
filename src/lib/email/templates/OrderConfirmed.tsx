import { Text } from "@react-email/components";
import { EmailLayout, emailStyles, shortOrderId } from "./_layout";

export interface OrderConfirmedEmailProps {
  orderId: string;
  customerName: string;
}

export function OrderConfirmedEmail({
  orderId,
  customerName,
}: OrderConfirmedEmailProps) {
  const shortId = shortOrderId(orderId);
  return (
    <EmailLayout preview={`Замовлення #${shortId} підтверджено`}>
      <Text style={emailStyles.heading}>
        Замовлення #{shortId} підтверджено
      </Text>
      <Text style={emailStyles.paragraph}>Вітаємо, {customerName}!</Text>
      <Text style={emailStyles.paragraph}>
        Дякуємо за замовлення в PuzzleShare. Ми підтвердили вашу оренду —
        наступним кроком буде відправка. Ми надішлемо номер для відстеження,
        щойно посилка буде в дорозі.
      </Text>
      <Text style={emailStyles.highlight}>Номер замовлення: #{shortId}</Text>
      <Text style={emailStyles.paragraph}>
        Якщо у вас виникнуть питання, просто дайте відповідь на цей лист.
      </Text>
      <Text style={emailStyles.paragraph}>
        Гарної гри!
        <br />
        Команда PuzzleShare
      </Text>
    </EmailLayout>
  );
}

export const orderConfirmedSubject = (orderId: string) =>
  `Замовлення #${shortOrderId(orderId)} підтверджено`;

export default OrderConfirmedEmail;
