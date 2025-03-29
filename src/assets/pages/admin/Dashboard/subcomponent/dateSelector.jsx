import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const DateSelection = ({onSelection}) => {
  const handleChange = (dates, dateStrings) => {
    if (!dates || dates.length === 0) {
      console.log("Range Picker is empty!");
      onSelection([dayjs().startOf("day"), dayjs().endOf("day")]);
    } else {
      console.log('Selected Time Range:', dates, dateStrings);
      onSelection(dates)
    }
  };

  return (
    <RangePicker 
      onChange={handleChange} 
    />
  );
};

export default DateSelection;
