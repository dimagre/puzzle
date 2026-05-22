import { Text } from "@react-email/components";
import { EmailLayout, emailStyles, shortOrderId } from "./_layout";

export interface OrderDeliveredEmailProps {
  orderId: string;
  customerName: string;
}

export function OrderDeliveredEmail({
  orderId,
  customerName,
}: OrderDeliveredEmailProps) {
  const shortId = shortOrderId(orderId);
  return (
    <EmailLayout preview={`Замовлення #${shortId} доставлено`}>
      <Text style={emailStyles.heading}>
        Замовлення #{shortId} доставлено
      </Text>
      <Text style={emailStyles.paragraph}>Вітаємо, {customerName}!</Text>
      <Text style={emailStyles.paragraph}>
        Раді повідомити: ваше замовлення доставлено. Сподіваємось, пазли
        принесуть багато радості та натхнення.
      </Text>
      <Text style={emailStyles.highlight}>Номер замовлення: #{shortId}</Text>
      <Text style={emailStyles.paragraph}>
        Не забудьте повернути пазли в строк — деталі ви знайдете у своєму
        профілі на сайті.
      </Text>
      <Text style={emailStyles.paragraph}>
        Дякуємо, що обираєте PuzzleShare!
        <br />
        Команда PuzzleShare
      </Text>
    </EmailLayout>
  );
}

export const orderDeliveredSubject = (orderId: string) =>
  `Замовлення #${shortOrderId(orderId)} доставлено`;

export default OrderDeliveredEmail;
