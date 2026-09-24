import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`

export default function ActionsPanel({ products, refresh, setNotice, member }) {
  const [purchase, setPurchase] = useState({ product_id: '', quantity: '', unit_cost: '' })
  const [expense, setExpense] = useState({ title: '', amount: '', category: 'General' })
  const [question, setQuestion] = useState('Aaj mera profit kitna hai?')
  const [answer, setAnswer] = useState('')

  const update = (setter) => (event) => setter((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function send(path, data, reset) {
    try {
      const response = await fetch(`${API}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Save nahi hua')
      reset()
      await refresh()
      setNotice('Record save ho gaya')
    } catch (error) { setNotice(error.message) }
  }

  async function askAssistant(event) {
    event.preventDefault()
    setAnswer('Hisab dekh raha hoon...')
    const response = await fetch(`${API}/assistant`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question }) })
    const result = await response.json()
    setAnswer(result.answer || 'Jawab nahi mila')
  }

  return <section className="operations advanced-actions">
    <div className="panel"><p className="eyebrow">MAAL ANDAR AAYA</p><h3>Purchase likhein</h3><form onSubmit={(event) => { event.preventDefault(); send('purchases', { ...purchase, member, product_id: Number(purchase.product_id), quantity: Number(purchase.quantity), unit_cost: Number(purchase.unit_cost) }, () => setPurchase({ product_id: '', quantity: '', unit_cost: '' })) }}><select required name="product_id" value={purchase.product_id} onChange={update(setPurchase)}><option value="">Maal chunein</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input required name="quantity" type="number" min="1" placeholder="Kitna maal aaya" value={purchase.quantity} onChange={update(setPurchase)} /><input required name="unit_cost" type="number" min="0" step="0.01" placeholder="Kharid rate" value={purchase.unit_cost} onChange={update(setPurchase)} /><button className="dark">Stock badhayein</button></form></div>
    <div className="panel"><p className="eyebrow">DUKAAN KA KHARCHA</p><h3>Expense likhein</h3><form onSubmit={(event) => { event.preventDefault(); send('expenses', { ...expense, member, amount: Number(expense.amount) }, () => setExpense({ title: '', amount: '', category: 'General' })) }}><input required name="title" placeholder="Kharcha kis cheez ka?" value={expense.title} onChange={update(setExpense)} /><input required name="amount" type="number" min="0" step="0.01" placeholder="Kitne rupaye" value={expense.amount} onChange={update(setExpense)} /><input name="category" placeholder="Category" value={expense.category} onChange={update(setExpense)} /><button className="outline">Kharcha save karein</button></form></div>
    <div className="panel assistant-panel"><p className="eyebrow">AI HISABDAR</p><h3>Sawal poochhein</h3><form onSubmit={askAssistant}><input name="question" value={question} onChange={(event) => setQuestion(event.target.value)} /><button>Jawab dein</button></form>{answer && <p className="assistant-answer">{answer}</p>}</div>
  </section>
}
