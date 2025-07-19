import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { PieChart } from 'react-native-chart-kit';

export default function LaundryAnalytics() {
  const [laundryData, setLaundryData] = useState([]);
  const [timeslots, setTimeslots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaundrySessions = async () => {
      try {
        setLoading(true);
        const user = getAuth().currentUser;
        if (!user) {
          setError("User not logged in");
          return;
        }

        const q = query(
          collection(db, 'laundry_sessions'),
          where('userId', '==', user.uid)
        );

        const snapshot = await getDocs(q);
        const sessions = snapshot.docs.map(doc => doc.data());
        setLaundryData(sessions);

        const slotCounts = {
          'Morning': 0,   // 5AM - 11AM
          'Noon': 0,      // 11AM - 2PM
          'Afternoon': 0, // 2PM - 6PM
          'Evening': 0,   // 6PM - 10PM
          'Night': 0,     // 10PM - 5AM
        };

        sessions.forEach(session => {
          if (!session.startTime || typeof session.startTime.toDate !== 'function') {
            console.warn("Invalid startTime format", session.startTime);
            return;
          }
          
          const date = session.startTime.toDate();
          const hour = date.getHours();

          if (hour >= 0 && hour < 5) {
            slotCounts['Night']++; // 0-4 AM
          } else if (hour >= 5 && hour < 11) {
            slotCounts['Morning']++;
          } else if (hour >= 11 && hour < 14) {
            slotCounts['Noon']++;
          } else if (hour >= 14 && hour < 18) {
            slotCounts['Afternoon']++;
          } else if (hour >= 18 && hour < 22) {
            slotCounts['Evening']++;
          } else {
            slotCounts['Night']++; // 10PM - 11:59PM
          }
        });

        setTimeslots(slotCounts);
        setError(null);
      } catch (err) {
        console.error("Data fetch error:", err);
        setError("Failed to load laundry data");
      } finally {
        setLoading(false);
      }
    };

    fetchLaundrySessions();
  }, []);

  const totalSessions = Object.values(timeslots).reduce((sum, val) => sum + val, 0);
  const hasData = totalSessions > 0;

  // Pie chart data
  const pieData = Object.entries(timeslots).map(([label, value], index) => ({
    name: `${label} (${value})`,
    population: value,
    color: ['#4dabf7', '#ffa94d', '#63e6be', '#ff6b6b', '#845ef7'][index],
    legendFontColor: '#333',
    legendFontSize: 12, // 减小图例字体大小
  }));

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
  };

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4dabf7" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView contentContainerStyle={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Laundry Analytics</Text>
      <Text style={styles.subtitle}>Total laundry sessions: {laundryData.length}</Text>

      {hasData ? (
        <>
          <View style={styles.card}>
            <Text style={styles.chartLabel}>Time Slot Distribution</Text>
            <PieChart
              data={pieData}
              width={Dimensions.get('window').width - 60}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="5"
              absolute
              style={styles.chart}
            />
            
            <View style={styles.divider} />
            
            {/* Time slot distribution details */}
            <Text style={styles.detailTitle}>Details</Text>
            {Object.entries(timeslots).map(([time, count]) => (
              <Text key={time} style={styles.detailText}>
                {time}: {count} sessions ({((count / totalSessions) * 100).toFixed(1)}%)
              </Text>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.noDataText}>No laundry data available</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#f2f4f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  chartLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#444',
    textAlign: 'center',
  },
  chart: {
    alignSelf: 'center',
    marginVertical: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
    marginHorizontal: -10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 12,
    color: '#444',
    textAlign: 'center',
  },
  detailText: {
    fontSize: 12,
    marginBottom: 8,
    color: '#555',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: '500',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
    fontStyle: 'italic',
  },
});