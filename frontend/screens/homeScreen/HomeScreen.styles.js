import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    padding: 25,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  welcome: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 0,
    color: 'grey',
  },
  navButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 0,
    gap: 5,
  },
  section: {
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  machineList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    maxHeight: 275,
    borderColor: '#4682B4',
    borderWidth: 1,
  },
  machineCard: {
    backgroundColor: '#f2f4f8',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  machineType: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  machineStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  machineLocation: {
    fontSize: 13,
    color: '#555',
  },
  button: {
    borderWidth: 1,
    borderColor: '#4682B4',
    borderRadius: 12,
    marginBottom: 5,
    overflow: 'hidden',
    width: '48%',
    backgroundColor: 'white',
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '700',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#4682B4',
    padding: 2,
    // marginHorizontal: 90,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewButton: {
    marginTop: 8,
    backgroundColor: '#4682B4',
    padding: 2,
    // marginHorizontal: 90,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  viewText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  timerScrollContainer: {
    marginVertical: 0,
    paddingLeft: 0,
  },

  timerCard: {
    backgroundColor: '#fff8e1',
    padding: 14,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    paddingBottom: 12,
  },

  stopButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  machineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6F00',
    marginBottom: 6,
  },

  timerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

  timeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D32F2F',
  },

  laundryCTA: {
    marginTop: 20,
    backgroundColor: '#f28705',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  laundryCTAText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

  secondaryNav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 5,
  },

  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4682B4',
  },

});
