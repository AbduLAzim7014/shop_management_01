import { useEffect, useState } from 'react'
import './App.css'
import ActionsPanel from './ActionsPanel'
import ReportsPanel from './ReportsPanel'
import UnifiedEntry from './UnifiedEntry'

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`
const emptyProduct = { name: '', sku: '', category: 'Wooden item', wood_type: 'General', dimensions: '', price: '' }
const emptySale = { product_id: '', quantity: '', unit_price: '', customer_name: '', channel: 'online', member: 'bhai-1' }
const woodenProducts = ['Belan', 'Chakla', 'Matani', 'Mathani']

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

function App() {
  const [dashboard, setDashboard] = useState(null)
  const [products, setProducts] = useState([])
  const [product, setProduct] = useState(emptyProduct)
  const [sale, setSale] = useState(emptySale)
  const [notice, setNotice] = useState('')
  const [member, setMember] = useState('bhai-1')

  async function refresh() {
    const [dash, items] = await Promise.all([fetch(`${API}/dashboard?member=${member}`), fetch(`${API}/products`)]);
    if (!dash.ok || !items.ok) throw new Error('Backend connect nahi hua')
    setDashboard(await dash.json())
    setProducts(await items.json())
  }

  useEffect(() => { refresh().catch((error) => setNotice(error.message)) }, [member])

  const update = (setter) => (event) => setter((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function save(path, data, reset) {
    setNotice('')
    const response = await fetch(`${API}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const result = await response.json()
    if (!response.ok) throw new Error(result.detail || 'Save failed')
    reset()
    await refresh()
    setNotice('Record save ho gaya')
  }

  const submit = (action) => async (event) => {
    event.preventDefault()
    try {
      if (action === 'product') await save('products', { ...product, price: Number(product.price), stock: 0, reorder_level: 5 }, () => setProduct(emptyProduct))
      if (action === 'sale') await save('sales', { ...sale, member, product_id: Number(sale.product_id), quantity: Number(sale.quantity), unit_price: sale.unit_price ? Number(sale.unit_price) : undefined }, () => setSale({ ...emptySale, member }))
    } catch (error) { setNotice(error.message) }
  }

  return <main className="shell">
    <header className="topbar"><div><p className="eyebrow">DUKAAN KA HISAB</p><h1>Shop Hisab <span>AI</span></h1></div><div className="status"><i /> <select className="member-select" value={member} onChange={(event) => setMember(event.target.value)}><option value="bhai-1">Bhai 1 ka hisab</option><option value="bhai-2">Bhai 2 ka hisab</option></select></div></header>
    <section className="intro"><div><p className="eyebrow">AAJ KA HISAB</p><h2>Maal, bikri aur munafa ek nazar mein.</h2></div><p className="intro-copy">Neeche product add karein aur bikri likhein. Stock aur profit apne aap badlega.</p></section>
    <section className="howto"><div><b>1</b><span><strong>Maal jodein</strong><small>Belan, Chakla ya koi item</small></span></div><div><b>2</b><span><strong>Purchase likhein</strong><small>Kitna maal andar aaya</small></span></div><div><b>3</b><span><strong>Sale likhein</strong><small>Online ya wholesale</small></span></div></section>
    {notice && <div className="notice">{notice}</div>}
    {products.length === 0 && <div className="notice">Sale likhne se pehle upar se Naya Maal jodein. Belan, Chakla ya Matani select kar sakte hain.</div>}
    <UnifiedEntry products={products} refresh={refresh} setNotice={setNotice} member={member} />
    <section className="stats"><article className="stat accent"><small>KUL BIKRI</small><strong>{money(dashboard?.revenue)}</strong><span>{dashboard?.units_sold || 0} maal bike</span></article><article className="stat"><small>SAF MUNAAFA</small><strong>{money(dashboard?.net_profit)}</strong><span>Kharcha kaat kar</span></article><article className="stat"><small>BACHA STOCK</small><strong>{dashboard?.stock_units || 0}</strong><span>{money(dashboard?.stock_value)} ka maal</span></article><article className="stat"><small>KAM STOCK</small><strong className="warning">{dashboard?.low_stock_count || 0}</strong><span>Jaldi mangayein</span></article></section>
    <section className="split"><div className="panel"><div className="panel-heading"><div><p className="eyebrow">BIKRI KA HISAB</p><h3>Online aur wholesale</h3></div><span className="period">Ab tak</span></div><div className="bars"><div><span className="bar-label">Online <b>{money(dashboard?.online_sales)}</b></span><div className="track"><i style={{ width: `${Math.min(100, (dashboard?.online_sales / (dashboard?.revenue || 1)) * 100)}%` }} /></div></div><div><span className="bar-label">Wholesale <b>{money(dashboard?.wholesale_sales)}</b></span><div className="track wholesale"><i style={{ width: `${Math.min(100, (dashboard?.wholesale_sales / (dashboard?.revenue || 1)) * 100)}%` }} /></div></div></div><div className="profit-line"><span>Kul munafa</span><strong>{money(dashboard?.gross_profit)}</strong></div></div><div className="panel"><p className="eyebrow">NAYA MAAL</p><h3>Wood item jodein</h3><form onSubmit={submit('product')}><input required name="name" list="wooden-products" placeholder="Item ka naam (Belan / Chakla)" value={product.name} onChange={update(setProduct)} /><datalist id="wooden-products">{woodenProducts.map((item) => <option key={item} value={item} />)}</datalist><div className="form-row"><input required name="wood_type" placeholder="Wood type (Sheesham)" value={product.wood_type} onChange={update(setProduct)} /><input name="dimensions" placeholder="Size (6 x 3 feet)" value={product.dimensions} onChange={update(setProduct)} /></div><input required name="price" type="number" placeholder="Bechne ka rate" value={product.price} onChange={update(setProduct)} /><button>Maal jodein</button></form></div></section>
    <section className="operations"><div className="panel"><p className="eyebrow">BIKRI LIKHEIN</p><h3>Aaj ki sale</h3><form onSubmit={submit('sale')}><select required name="product_id" value={sale.product_id} onChange={update(setSale)}><option value="">Maal chunein</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.stock} bacha</option>)}</select><div className="form-row"><input required name="quantity" type="number" min="1" placeholder="Kitna becha" value={sale.quantity} onChange={update(setSale)} /><input name="unit_price" type="number" placeholder="Bechne ka rate" value={sale.unit_price} onChange={update(setSale)} /></div><input name="customer_name" placeholder="Customer ka naam" value={sale.customer_name} onChange={update(setSale)} /><select name="channel" value={sale.channel} onChange={update(setSale)}><option value="online">Online customer</option><option value="wholesale">Wholesale customer</option></select><button>Sale save karein</button></form></div><div className="panel"><p className="eyebrow">MAAL KI LIST</p><h3>Abhi kitna bacha hai</h3>{products.length === 0 ? <p className="empty">Pehle maal jodein.</p> : <div className="table-wrap"><table><thead><tr><th>MAAL</th><th>STOCK</th><th>HALAT</th></tr></thead><tbody>{products.map((item) => <tr key={item.id}><td><b>{item.name}</b><small>{item.sku}</small></td><td>{item.stock}</td><td><span className={`pill ${item.stock <= item.reorder_level ? 'low' : ''}`}>{item.stock <= item.reorder_level ? 'Mangayein' : 'Theek hai'}</span></td></tr>)}</tbody></table></div>}</div><div className="panel summary"><p className="eyebrow">CHHOTA HISAB</p><h3>Kahan se bikri hui</h3><div className="profit-line"><span>Online</span><strong>{money(dashboard?.online_sales)}</strong></div><div className="profit-line"><span>Wholesale</span><strong>{money(dashboard?.wholesale_sales)}</strong></div><div className="profit-line"><span>Kharcha</span><strong>{money(dashboard?.expenses)}</strong></div></div></section>
    <ActionsPanel products={products} refresh={refresh} setNotice={setNotice} member={member} />
    <ReportsPanel member={member} />
  </main>
}

export default App
