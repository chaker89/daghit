import { Text, TextInput, View } from 'react-native';
import { styles } from './TextField.styles';

export type TextFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
};

export function TextField({ label, placeholder, value, onChangeText, multiline = false, required = false }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#929E9D" multiline={multiline} style={[styles.input, multiline && styles.multiline]} textAlignVertical={multiline ? 'top' : 'center'} />
    </View>
  );
}

