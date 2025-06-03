import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const DateSelection = ({ onSelection }) => {
  const handleChange = (dates, dateStrings) => {
    if (!dates || dates.length === 0) {
      console.log("Range Picker is empty!");
      onSelection([dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]);
    } else {
      onSelection(dateStrings);
    }
  };

  return (
    <RangePicker
      onChange={handleChange}
      disabledDate={(date) => date && date > dayjs().startOf('day')}
    />
  );
};

export default DateSelection;
