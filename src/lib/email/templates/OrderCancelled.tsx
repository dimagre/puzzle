import { Text } from "@react-email/components";
import { EmailLayout, emailStyles, shortOrderId } from "./_layout";

export interface OrderCancelledEmailProps {
  orderId: string;
  customerName: string;
}

export function OrderCancelledEmail({
  orderId,
  customerName,
}: OrderCancelledEmailProps) {
  const shortId = shortOrderId(orderId);
  return (
    <EmailLayout preview={`Замовлення #${shortId} скасовано`}>
      <Text style={emailStyles.heading}>
        Замовлення #{shortId} скасовано
      </Text>
      <Text style={emailStyles.paragraph}>Вітаємо, {customerName}.</Text>
      <Text style={emailStyles.paragraph}>
        Ваше замовлення було скасоване. Якщо платіж уже був здійснений, кошти
        повернуться на ваш рахунок протягом кількох робочих днів.
      </Text>
      <Text style={emailStyles.highlight}>Номер замовлення: #{shortId}</Text>
      <Text style={emailStyles.paragraph}>
        Якщо це сталося помилково або у вас є запитання — просто дайте
        відповідь на цей лист, і ми допоможемо.
      </Text>
      <Text style={emailStyles.paragraph}>
        Команда PuzzleShare
      </Text>
    </EmailLayout>
  );
}

export const orderCancelledSubject = (orderId: string) =>
  `Замовлення #${shortOrderId(orderId)} скасовано`;

export default OrderCancelledEmail;
