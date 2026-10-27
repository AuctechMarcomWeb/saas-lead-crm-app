import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ArrowHeader = ({ title, rightIcon, rightIcon2, onRightPress, onRightPress2 }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back-sharp" color="black" size={20} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

      <View style={styles.rightContainer}>
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.rightIcon}>
            <Icon name={rightIcon} color="#22C55E" size={24} />
          </TouchableOpacity>
        ) : null}
        {rightIcon2 ? (
          <TouchableOpacity onPress={onRightPress2} style={styles.rightIcon}>
            <Icon name={rightIcon2} color="#22C55E" size={24} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default ArrowHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: '5%',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  backButton: {
    marginRight: '5%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },

  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  rightIcon: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
