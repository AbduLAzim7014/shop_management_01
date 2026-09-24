import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`
const empty = { name: '', wood_type: 'General', dimensions: '', pieces_per_bundle: 350, price: '', product_id: '', bundles: '', pieces: '', unit_cost: '', unit_price: '', customer_name: '', channel: 'online', title: '', amount: '', category: 'General' }

export default function UnifiedEntry({ products, refresh, setNotice, member }) {
  const [type, setType] = useState('sales')
  const [form, setForm] = useState(empty)
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    let path = type
    let data = { ...form, member }
    if (type === 'products') data = { name: form.name, wood_type: form.wood_type, dimensions: form.dimensions || undefined, pieces_per_bundle: Number(form.pieces_per_bundle), category: 'Wooden item', price: Number(form.price), stock: 0, reorder_level: 5 }
    if (type === 'purchases') data = { product_id: Number(form.product_id), bundles: Number(form.bundles || 0), pieces: Number(form.pieces || 0), unit_cost: Number(form.unit_cost), member }
    if (type === 'sales') data = { product_id: Number(form.product_id), bundles: Number(form.bundles || 0), pieces: Number(form.pieces || 0), unit_price: form.unit_price ? Number(form.unit_price) : undefined, customer_name: form.customer_name || undefined, channel: form.channel, member }
    if (type === 'expenses') data = { title: form.title, amount: Number(form.amount), category: form.category, member }
    try {
      const response = await fetch(`${API}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Save nahi hua')
      setForm(empty)
      await refresh()
      setNotice('Entry save ho gayi')
    } catch (error) { setNotice(error.message) }
  }

  const productSelect = <select required name="product_id" value={form.product_id} onChange={update}><option value="">{products.length ? 'Maal chunein' : 'Pehle Naya Maal jodein'}</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.stock} bacha</option>)}</select>
  return <section className="unified-entry panel"><div className="unified-heading"><div><p className="eyebrow">EK HI JAGAH PAR SAB HISAB</p><h3>Aaj ki entry</h3></div><select className="entry-type" value={type} onChange={(event) => { setType(event.target.value); setForm(empty) }}><option value="sales">Sale</option><option value="purchases">Purchase</option><option value="products">Naya maal</option><option value="expenses">Kharcha</option></select></div>
  <form onSubmit={submit} className="unified-form">
  {type === 'products' && <><input required name="name" placeholder="Item ka naam: Belan / Chakla" value={form.name} onChange={update} /><div className="form-row"><input required name="wood_type" placeholder="Lakdi: Sheesham" value={form.wood_type} onChange={update} /><input name="dimensions" placeholder="Size: 2 feet" value={form.dimensions} onChange={update} /></div><input required name="pieces_per_bundle" type="number" min="1" placeholder="1 bundle mein pieces (350)" value={form.pieces_per_bundle} onChange={update} /><input required name="price" type="number" min="1" placeholder="Bechne ka rate / piece" value={form.price} onChange={update} /></>}
  {type === 'purchases' && <>{productSelect}<div className="form-row"><input name="bundles" type="number" min="0" placeholder="Kitne bundle" value={form.bundles} onChange={update} /><input name="pieces" type="number" min="0" placeholder="Extra pieces" value={form.pieces} onChange={update} /></div><input required name="unit_cost" type="number" min="0" step="0.01" placeholder="Kharid rate / piece" value={form.unit_cost} onChange={update} /></>}
  {type === 'sales' && <>{productSelect}<div className="form-row"><input name="bundles" type="number" min="0" placeholder="Kitne bundle" value={form.bundles} onChange={update} /><input name="pieces" type="number" min="0" placeholder="Extra pieces" value={form.pieces} onChange={update} /></div><div className="form-row"><input name="unit_price" type="number" min="0" step="0.01" placeholder="Bechne ka rate / piece" value={form.unit_price} onChange={update} /><input name="customer_name" placeholder="Customer ka naam" value={form.customer_name} onChange={update} /></div><select name="channel" value={form.channel} onChange={update}><option value="online">Online</option><option value="wholesale">Wholesale</option></select></>}
      {type === 'expenses' && <><input required name="title" placeholder="Kharcha kis cheez ka?" value={form.title} onChange={update} /><div className="form-row"><input required name="amount" type="number" min="0" step="0.01" placeholder="Kitne rupaye" value={form.amount} onChange={update} /><input name="category" placeholder="Category" value={form.category} onChange={update} /></div></>}
      <button className="unified-button">{type === 'sales' ? 'Sale save karein' : type === 'purchases' ? 'Stock badhayein' : type === 'products' ? 'Maal jodein' : 'Kharcha save karein'}</button>
    </form>
  </section>
}
