import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`
const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function ReportsPanel({ member }) {
  const [items, setItems] = useState([])
  const [months, setMonths] = useState([])

  useEffect(() => {
    Promise.all([fetch(`${API}/reports/items?member=${member}`), fetch(`${API}/reports/monthly?member=${member}`)])
      .then(async ([itemsResponse, monthsResponse]) => { setItems(await itemsResponse.json()); setMonths(await monthsResponse.json()) })
      .catch(() => { setItems([]); setMonths([]) })
  }, [member])

  return <section className="reports-grid">
    <div className="panel"><p className="eyebrow">ITEM REPORT</p><h3>Har item ka hisab</h3><div className="table-wrap"><table><thead><tr><th>ITEM</th><th>SALE</th><th>PURCHASE</th><th>PROFIT</th></tr></thead><tbody>{items.map((item) => <tr key={item.name}><td><b>{item.name}</b><small>{item.wood_type}</small></td><td>{money(item.sale_total)}<small>{item.sold_qty} sold</small></td><td>{money(item.purchase_total)}<small>{item.bought_qty} bought</small></td><td><span className="profit-value">{money(item.profit)}</span></td></tr>)}</tbody></table></div></div>
    <div className="panel"><p className="eyebrow">MONTH REPORT</p><h3>Mahine ki sale</h3>{months.length === 0 ? <p className="empty">Abhi monthly sale nahi hai.</p> : <div className="month-list">{months.map((month) => <div className="month-row" key={month.month}><span>{month.month}<small>{month.sold_qty} items sold</small></span><strong>{money(month.sale_total)}</strong></div>)}</div>}</div>
  </section>
}
