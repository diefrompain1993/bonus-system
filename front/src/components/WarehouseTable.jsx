import { useState } from 'react';
import { Table, Button, Switch } from 'antd';

const WarehouseTable = ({ data: [data, can_add], userInfo, loading }) => {
  const [selected, setSelected] = useState({});
  const [sent, setSent] = useState(false);
  const [mode, setMode] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  const columns = [
    {
      title: 'Номер полки', 
      dataIndex: 'shelf',
      key: 'shelf',
      render: (text) => <div className="shelf-column">{text}</div>,
    },
    {
      title: 'Модель',
      dataIndex: 'model',
      key: 'model',
      render: (text) => <div className="model-column">{text}</div>,
    },
    {
      title: 'Кол-во',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => <div className="quantity-column">{text}</div>,
    },
    {
      title: can_add ? <Switch onChange={setMode} checkedChildren="Добавить" unCheckedChildren="Взять" /> : 'Взять',
      dataIndex: 'select',
      key: 'select',
    },
  ];

  const dataSource = Object.entries(data).map(([shelf, items], index) => ({
    key: index,
    shelf,
    children: Object.entries(items).map(([model, quantity], index) => ({
      key: `${index}-${model}`,
      model,
      quantity: quantity[0],
      select: (
        <div className="select-column">
          <input
            type="number"
            min={0}
            max={mode ? null : quantity[0]}
            defaultValue={0}
            inputMode="numeric"
            pattern="[0-9]*"
            step={1}
            onFocus={(e) => {
              e.target.style.outline = mode ? '2px solid #0278d8' : '2px solid #e05050';
              e.target.value = 0;
            }}
            onBlur={(e) => {
              if (e.target.value !== 0) {
                e.target.style.outline = mode ? '2px solid #0278d8' : '2px solid #e05050';
              }
            }}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (e.target.value === "") {
                e.target.value = 0;
              }
              if (value > quantity[0] && !mode) {
                e.target.value = quantity[0];
              }
              if (e.target.value[0] === "0" && e.target.value.length > 1) {
                e.target.value = e.target.value.slice(1);
              }
              setSelected((prev) => ({
                ...prev,
                [quantity[1]]: mode ? -Number(e.target.value) : Number(e.target.value),
              }));
            }}
          />
        </div>
      ),
    }))
  }));

  const handleSave = () => {
    if (!buttonClicked) {
      setButtonClicked(true);
      fetch('https://sibeeria.ru:8000/warehouse/update-gs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selected, userInfo })
      })
      .then(response => response.json())
      .then(data => {
        setSent(true);
        setTimeout(() => window.location.reload(), 400);
      })
      .catch(error => console.error('Error:', error));
    }
  };

  return (
    <>
      <div className='save-button'>
        <Button onClick={handleSave} type="primary" disabled={sent || buttonClicked}>
          {sent ? 'Отправлено' : 'Отправить'}
        </Button>
      </div>
      <Table pagination={false} loading={loading} dataSource={dataSource} columns={columns} />
    </>
  );
};

export default WarehouseTable;


