import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.ttf',
      fontWeight: 'bold',
    }
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingTop: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  subheader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  inlineSection: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
    minHeight: 20,
  },
  inlineLabel: {
    fontWeight: 'bold',
    width: 100,
    marginRight: 10,
  },
  inlineValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 3,
  },
  table: {
    width: '100%',
    marginTop: 15,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    borderCollapse: 'collapse',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 24,
  },
  colNumber: {
    width: '5%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    paddingVertical: 4,
    textAlign: 'center'
  },
  colName: {
    width: '57%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    paddingVertical: 4,
    paddingHorizontal: 3,
    textAlign: 'left'
  },
  colPrice: {
    width: '15%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    paddingVertical: 4,
    textAlign: 'center'
  },
  colQuantity: {
    width: '8%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    paddingVertical: 4,
    textAlign: 'center'
  },
  colTotal: {
    width: '15%',
    paddingVertical: 4,
    textAlign: 'center'
  },
  colHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold'
  },
  totalRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
  },
  note: {
    marginTop: 20,
  },
  signatureContainer: {
    marginTop: 30,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  signatureBox: {
    width: '45%',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 3,
  },
  summaryRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export const DeliveryDocument = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>ЛИСТ ДОСТАВКИ ТОВАРА</Text>
      <Text style={styles.subheader}>Заказ #{order.id}</Text>

      {/* Секция Ф.И.О. в одну строку с подчеркиванием */}
      <View style={styles.inlineSection}>
        <Text style={styles.inlineLabel}>Ф.И.О.</Text>
        <Text style={styles.inlineValue}>{order.customer_name}</Text>
      </View>

      {/* Секция адреса в одну строку с подчеркиванием */}
      <View style={styles.inlineSection}>
        <Text style={styles.inlineLabel}>Адрес доставки</Text>
        <Text style={styles.inlineValue}>{order.full_address}</Text>
      </View>

      {/* Секция телефона в одну строку с подчеркиванием */}
      <View style={styles.inlineSection}>
        <Text style={styles.inlineLabel}>Телефон</Text>
        <Text style={styles.inlineValue}>{order.customer_phone}</Text>
      </View>

      <Text style={{fontWeight: 'bold', marginBottom: 5, marginTop: 10}}>Состав заказа</Text>
      
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.colNumber, styles.colHeader]}>№</Text>
          <Text style={[styles.colName, styles.colHeader]}>Наименование</Text>
          <Text style={[styles.colPrice, styles.colHeader]}>Цена</Text>
          <Text style={[styles.colQuantity, styles.colHeader]}>Кол-во</Text>
          <Text style={[styles.colTotal, styles.colHeader]}>Сумма</Text>
        </View>
        
        {order.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colNumber}>{index + 1}</Text>
            <Text style={styles.colName}>{item.name}</Text>
            <Text style={styles.colPrice}>{item.price_final} руб.</Text>
            <Text style={styles.colQuantity}>{item.quantity}</Text>
            <Text style={styles.colTotal}>{item.item_total} руб.</Text>
          </View>
        ))}
      </View>
      <View style={styles.summaryRow}>
        <Text>Всего</Text>
        <Text>{order.order_subtotal - order.order_discount} руб.</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text>Доставка {order.delivery_type === 'courier' ? 'курьерская доставка' : `Пункт выдачи заказов (${order.pickup_point || 'ПВЗ'})`}</Text>
        <Text>{order.delivery_price} руб.</Text>
      </View>

      <View style={styles.totalRow}>
        <Text>Итого</Text>
        <Text>{order.order_total} руб.</Text>
      </View>


      <View style={styles.note}>
        <Text style={{fontWeight: 'bold'}}>Примечание к заказу</Text>
        <Text>{order.delivery_comment || 'Нет примечаний'}</Text>
      </View>

      <View style={styles.signatureContainer}>
        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text>Время отправки</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Дата доставки</Text>
          </View>
        </View>
        
        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text>Время доставки</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Подпись получателя</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);