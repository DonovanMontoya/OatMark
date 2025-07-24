import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '50%',
  },
  label: {
    textAlign: 'center',
    marginVertical: 5,
    fontSize: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  cardText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
    paddingVertical: 5,
  },
  cardInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  upCharge: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    textAlign: 'right',
    marginLeft: 10,
  },
  oatMilk: {
    fontSize: 14,
    color: '#555',
  },
    locationButton: {
      position: 'absolute',
      bottom: 20,
        right: 20,
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 8,
        zIndex: 1,
    },
});
