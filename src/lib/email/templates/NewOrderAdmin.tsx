import { Text } from "@react-email/components";
import { EmailLayout, emailStyles, shortOrderId } from "./_layout";

export interface NewOrderAdminEmailProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  itemCount: number;
}

const formatUah = (value: number): string =>
  `${value.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₴`;

export function NewOrderAdminEmail({
  orderId,
  customerName,
  customerEmail,
  totalAmount,
  itemCount,
}: NewOrderAdminEmailProps) {
  const shortId = shortOrderId(orderId);
  return (
    <EmailLayout
      preview={`Нове замовлення #${shortId} від ${customerName}`}
    >
      <Text style={emailStyles.heading}>
        Нове замовлення #{shortId}
      </Text>
      <Text style={emailStyles.paragraph}>
        На сайті PuzzleShare щойно з&apos;явилося нове замовлення.
      </Text>
      <Text style={emailStyles.highlight}>
        Замовник: <strong>{customerName}</strong>
        <br />
        Email: {customerEmail}
        <br />
        Кількість позицій: {itemCount}
        <br />
        Сума (з депозитом): <strong>{formatUah(totalAmount)}</strong>
      </Text>
      <Text style={emailStyles.paragraph}>
        Перейдіть в адмін-панель, щоб підтвердити замовлення та підготувати
        його до відправки.
      </Text>
    </EmailLayout>
  );
}

export const newOrderAdminSubject = (
  orderId: string,
  customerName: string,
): string =>
  `Нове замовлення #${shortOrderId(orderId)} від ${customerName}`;

export default NewOrderAdminEmail;
