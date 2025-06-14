import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  table: {
    width: '100%',
    marginTop: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
  },
  totalRow: {
    flexDirection: 'row',
    fontWeight: 'bold',
  },
  deliveryInfo: {
    marginTop: 15,
  },
  note: {
    marginTop: 15,
    fontStyle: 'italic',
  },
  signature: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
  },
});

export const DeliveryDocument = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page} language='Ru'>
      <Text style={styles.header}>Лист доставки товара</Text>
      <Text style={styles.subheader}>Заказ #{order.id}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Ф.И.О.</Text>
        <Text>{order.customer_name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Адрес доставки</Text>
        <Text>{order.full_address}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Телефон</Text>
        <Text>{order.customer_phone}</Text>
      </View>

      <Text style={styles.label}>Состав заказа</Text>
      
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>№</Text>
          <Text style={styles.tableColHeader}>Наименование</Text>
          <Text style={styles.tableColHeader}>Цена</Text>
          <Text style={styles.tableColHeader}>Кол-во</Text>
          <Text style={styles.tableColHeader}>Сумма</Text>
        </View>
        
        {order.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCol}>{index + 1}</Text>
            <Text style={styles.tableCol}>{item.name}</Text>
            <Text style={styles.tableCol}>{item.price} руб.</Text>
            <Text style={styles.tableCol}>{item.quantity}</Text>
            <Text style={styles.tableCol}>{item.price * item.quantity} руб.</Text>
          </View>
        ))}
        
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text style={styles.tableCol}></Text>
          <Text style={styles.tableCol}>Всего</Text>
          <Text style={styles.tableCol}></Text>
          <Text style={styles.tableCol}></Text>
          <Text style={styles.tableCol}>{order.order_subtotal} руб.</Text>
        </View>
      </View>

      <View style={styles.deliveryInfo}>
        <Text>Доставка {order.delivery_type}</Text>
        <Text>{order.delivery_price} руб.</Text>
      </View>

      <View style={styles.deliveryInfo}>
        <Text style={{ fontWeight: 'bold' }}>Итого</Text>
        <Text style={{ fontWeight: 'bold' }}>{order.order_total} руб.</Text>
      </View>

      <View style={styles.note}>
        <Text style={styles.label}>Примечание к заказу</Text>
        <Text>{order.delivery_comment || 'Нет примечаний'}</Text>
      </View>

      <View style={styles.signature}>
        <View style={styles.signatureBox}>
          <Text>Время отправки</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text>Дата доставки</Text>
        </View>
      </View>
      
      <View style={styles.signature}>
        <View style={styles.signatureBox}>
          <Text>Время доставки</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text>Подпись получателя</Text>
        </View>
      </View>
    </Page>
  </Document>
);