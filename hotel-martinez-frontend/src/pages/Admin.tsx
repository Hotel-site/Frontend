import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { productApi } from '../api/productApi'
import { userApi, type UserProfile } from '../api/userApi'
import { roomApi } from '../api/roomApi'
import { dishApi } from '../api/dishApi'
import { attractionApi } from '../api/attractionApi'
import { categoryApi, type CategoryDto } from '../api'
import type { Room } from '../types/room'
import type { Dish, DayOfWeek, MealType } from '../types/dish'
import type { Product as UiProduct } from '../types/product'
import type { AttractionBackendDto, OpeningHour } from '../api/attractionApi'
import ErrorState from '../components/ErrorState/ErrorState'
import '../styles/admin.css'

type Tab = 'products' | 'rooms' | 'menus' | 'attractions' | 'categories' | 'users' | 'dashboard'
type ConfirmDelete = { type: string; id: number | string; name: string } | null

const DAY_LABELS: Record<string, string> = { Monday: 'Понедельник', Tuesday: 'Вторник', Wednesday: 'Среда', Thursday: 'Четверг', Friday: 'Пятница', Saturday: 'Суббота', Sunday: 'Воскресенье' }
const MEAL_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Dessert']
const mealTypeLabels: Record<MealType, string> = { Breakfast: 'Завтрак', Lunch: 'Обед', Dinner: 'Ужин', Drinks: 'Напитки', Dessert: 'Десерты' }

function toNum(s: string) { const n = parseFloat(s); return isNaN(n) ? 0 : n }

export default function Admin() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [confirm, setConfirm] = useState<ConfirmDelete>(null)
  const confirmAndDelete = (item: ConfirmDelete) => setConfirm(item)
  const [cats, setCats] = useState<CategoryDto[]>([])
  const [products, setProducts] = useState<UiProduct[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [attractions, setAttractions] = useState<AttractionBackendDto[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [cat, p, r, d, a, u] = await Promise.all([
        categoryApi.getAll().catch(e => { console.error('Failed to load categories:', e); return [] }),
        productApi.getAll().catch(e => { console.error('Failed to load products:', e); return [] }),
        roomApi.getAll().catch(e => { console.error('Failed to load rooms:', e); return [] }),
        dishApi.getAll().catch(e => { console.error('Failed to load dishes:', e); return [] }),
        attractionApi.getAll().catch(e => { console.error('Failed to load attractions:', e); return [] }),
        userApi.getAll().catch(e => { console.error('Failed to load users:', e); return [] }),
      ])
      setCats(cat ?? []); setProducts(p ?? []); setRooms(r ?? []); setDishes(d ?? []); setAttractions(a ?? []); setUsers(u ?? [])
    } catch (e) { console.error('Unexpected error:', e) } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const del = async (item: ConfirmDelete) => {
    if (!item) return
    try {
      if (item.type === 'product') await productApi.remove(item.id as number)
      else if (item.type === 'room') await roomApi.remove(item.id as number)
      else if (item.type === 'dish') await dishApi.remove(item.id as number)
      else if (item.type === 'attraction') await attractionApi.remove(item.id as number)
      else if (item.type === 'category') await categoryApi.remove(item.id as number)
      else if (item.type === 'user') await userApi.remove(item.id as number)
      await load()
    } catch (err: any) { alert('Ошибка: ' + (err?.response?.data?.message || err?.message)) }
    setConfirm(null)
  }

  if (!user || user.role !== 'admin') {
    return <ErrorState title="Страница не найдена" message="Путь указан неверно." emoji="(x_x)" imageUrl="/cry.gif" />
  }

  const nav = (['dashboard', 'products', 'rooms', 'menus', 'attractions', 'categories', 'users'] as Tab[]).map(t => ({
    t, label: t === 'dashboard' ? '📊 Статистика' : t === 'products' ? '🛍️ Продукты' : t === 'rooms' ? '🏨 Номера' : t === 'menus' ? '🍽️ Меню' : t === 'attractions' ? '🗺️ Туризм' : t === 'categories' ? '🏷️ Категории' : '👥 Пользователи'
  }))

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Панель администратора</h1>
          <div className="admin-user-info">
            <span>{user?.username} ({user?.email})</span>
            <button className="btn-logout" onClick={logout}>Выход</button>
          </div>
        </div>
      </header>
      <div className="admin-layout">
        <nav className="admin-nav">
          {nav.map(n => <button key={n.t} className={`nav-btn ${tab === n.t ? 'active' : ''}`} onClick={() => setTab(n.t)}>{n.label}</button>)}
        </nav>
        <main className="admin-main">
          {loading ? (
            <div className="admin-loading"><div className="loading-spinner"></div><p>Загрузка данных...</p></div>
          ) : (
            <>
              {tab === 'dashboard' && <Dashboard products={products.length} rooms={rooms.length} dishes={dishes.length} attractions={attractions.length} />}
              {tab === 'products' && <ProductsTab items={products} cats={cats} del={confirmAndDelete} load={load} />}
              {tab === 'rooms' && <RoomsTab items={rooms} del={confirmAndDelete} load={load} />}
              {tab === 'menus' && <MenusTab items={dishes} del={confirmAndDelete} load={load} />}
              {tab === 'attractions' && <AttractionsTab items={attractions} cats={cats} del={confirmAndDelete} load={load} />}
              {tab === 'categories' && <CategoriesTab cats={cats} del={confirmAndDelete} load={load} />}
              {tab === 'users' && <UsersTab items={users} del={confirmAndDelete} load={load} />}
            </>
          )}
        </main>
      </div>
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">{confirm.type === 'product' ? '🛍️' : confirm.type === 'room' ? '🏨' : confirm.type === 'dish' ? '🍽️' : confirm.type === 'attraction' ? '🗺️' : confirm.type === 'user' ? '👥' : '🏷️'}</div>
            <h3>Подтверждение удаления</h3>
            <p>Удалить <strong>"{confirm.name}"</strong>?</p>
            <p className="confirm-warning">⚠️ Это действие невозможно отменить</p>
            <div className="confirm-buttons">
              <button className="btn-cancel" onClick={() => setConfirm(null)}>Отменить</button>
              <button className="btn-delete-confirm" onClick={() => del(confirm)}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoriesTab({ cats, del, load }: { cats: CategoryDto[]; del: (c: ConfirmDelete) => void; load: () => Promise<void> }) {
  const [edit, setEdit] = useState<CategoryDto | null>(null)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const saveEdit = async () => {
    if (!edit || !name.trim()) return; setSaving(true)
    try { await categoryApi.update(edit.id, name.trim()); await load(); setEdit(null); setName('') }
    catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  const create = async () => {
    if (!name.trim()) return; setSaving(true)
    try { await categoryApi.create(name.trim()); await load(); setAdding(false); setName('') }
    catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  return (
    <div className="admin-tab">
      <div className="tab-header"><h2>🏷️ Управление категориями</h2><button className="btn-primary" onClick={() => { setName(''); setAdding(true) }}>+ Добавить категорию</button></div>
      <div className="items-table"><table>
        <thead><tr><th>ID</th><th>Название</th><th>Действия</th></tr></thead>
        <tbody>{cats.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td className="action-cell"><button className="btn-small btn-edit" onClick={() => { setEdit(c); setName(c.name) }}>✏️ Редакт.</button><button className="btn-small btn-delete" onClick={() => del({ type: 'category', id: c.id, name: c.name })}>🗑️ Удалить</button></td></tr>)}</tbody>
      </table></div>

      {(edit) && (
        <Modal title="✏️ Редактирование категории" onClose={() => { setEdit(null); setName('') }}>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Название категории</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Введите название" /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setEdit(null); setName('') }}>Отменить</button>
            <button className="btn-primary" onClick={saveEdit} disabled={saving}>{saving ? '💾 Сохранение...' : '💾 Сохранить'}</button>
          </div>
        </Modal>
      )}

      {(adding) && (
        <Modal title="➕ Добавление категории" onClose={() => { setAdding(false); setName('') }}>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Название категории</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Введите название" /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setAdding(false); setName('') }}>Отменить</button>
            <button className="btn-primary" onClick={create} disabled={saving}>{saving ? '✅ Создание...' : '✅ Создать'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Dashboard({ products, rooms, dishes, attractions }: { products: number; rooms: number; dishes: number; attractions: number }) {
  const [users, setUsers] = useState<UserProfile[]>([])
  useEffect(() => { userApi.getAll().then(setUsers).catch(() => {}) }, [])

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.isActive).length

  return (
    <div className="admin-tab">
      <h2>📊 Статистика</h2>
      <div className="stats-grid">
        <div className="stat-card"><h3>Всего продуктов</h3><p className="stat-number">{products}</p></div>
        <div className="stat-card"><h3>Всего номеров</h3><p className="stat-number">{rooms}</p></div>
        <div className="stat-card"><h3>Блюд в меню</h3><p className="stat-number">{dishes}</p></div>
        <div className="stat-card"><h3>Достопримечательности</h3><p className="stat-number">{attractions}</p></div>
        <div className="stat-card"><h3>Пользователей</h3><p className="stat-number">{totalUsers}</p><p style={{ fontSize: '12px', opacity: 0.8 }}>Активных: {activeUsers}</p></div>
        <div className="stat-card"><h3>Статус системы</h3><p className="stat-status">🟢 Активна</p></div>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children, big = false }: { title: string; onClose: () => void; children: React.ReactNode; big?: boolean }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={big ? "modal-content" : "modal-content modal-small"} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ProductsTab({ items, cats, del, load }: { items: UiProduct[]; cats: CategoryDto[]; del: (c: ConfirmDelete) => void; load: () => Promise<void> }) {
  const [edit, setEdit] = useState<UiProduct | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<{ title: string; price: number; desc: string; imgs: string[]; catName: string; catId: number | null } | null>(null)
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  const openEdit = (p: UiProduct) => {
    setEdit(p)
    const c = cats.find(x => x.name === p.category)
    setForm({ title: p.title, price: p.price, desc: p.description || '', imgs: p.images || [], catName: p.category, catId: c?.id ?? null })
    setUrl(''); setImgIdx(0)
  }

  const saveEdit = async () => {
    if (!edit || !form) return; setSaving(true)
    try {
      await productApi.update(edit.id, { ...edit, title: form.title, price: form.price, description: form.desc, images: form.imgs, category: form.catName as any, image: form.imgs[0] || '', categoryId: form.catId } as any)
      await load(); setEdit(null); setForm(null)
    } catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  const create = async () => {
    if (!form) return; setSaving(true)
    try {
      await productApi.create({ id: 0, title: form.title, price: form.price, description: form.desc, images: form.imgs, image: form.imgs[0] || '', category: form.catName as any, categoryId: form.catId } as any)
      await load(); setAdding(false); setForm(null)
    } catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  return (
    <div className="admin-tab">
      <div className="tab-header"><h2>🛍️ Управление продуктами</h2><button className="btn-primary" onClick={() => { const c = cats[0]; setForm({ title: '', price: 0, desc: '', imgs: [], catName: c?.name || '', catId: c?.id ?? null }); setAdding(true) }}>+ Добавить продукт</button></div>
      <div className="items-table"><table>
        <thead><tr><th>ID</th><th>Название</th><th>Категория</th><th>Цена</th><th>Действия</th></tr></thead>
        <tbody>{items.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.title}</td><td>{p.category}</td><td>{p.price} €</td><td className="action-cell"><button className="btn-small btn-edit" onClick={() => openEdit(p)}>✏️ Редакт.</button><button className="btn-small btn-delete" onClick={() => del({ type: 'product', id: p.id, name: p.title })}>🗑️ Удалить</button></td></tr>)}</tbody>
      </table></div>

      {(edit && form) && (
        <Modal title="✏️ Редактирование товара" onClose={() => { setEdit(null); setForm(null) }} big>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Название товара</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Введите название" /></div>
              <div className="form-group"><label>Цена (€)</label><input type="text" inputMode="decimal" value={form.price === 0 ? '' : String(form.price)} onChange={e => setForm({ ...form, price: toNum(e.target.value.replace(/[^0-9.]/g, '')) })} onBlur={e => { if (!e.target.value) setForm({ ...form, price: 0 }) }} placeholder="Введите цену" /></div>
              <div className="form-group">
                <label>Категория</label>
                <div className="custom-dropdown">
                  <select value={form.catId ?? ''} onChange={e => { const c = cats.find(x => x.id === +e.target.value); if (c) setForm({ ...form, catName: c.name, catId: c.id }) }} className="custom-dropdown-btn" style={{ width: '100%', padding: '10px', background: '#1a2332', color: '#c8c8d8', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '8px' }}>
                    <option value="" disabled>Выберите категорию</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Описание</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={6} placeholder="Введите описание товара" /></div>
              <div className="form-group">
                <label>Фотографии товара</label>
                <div className="images-manager">
                  {form.imgs.length > 0 && <div className="images-list">{form.imgs.map((img, i) => <div key={i} className="image-item"><img src={img} alt="" /><div className="image-controls"><button type="button" className="btn-image-delete" onClick={() => setForm({ ...form, imgs: form.imgs.filter((_, j) => j !== i) })} title="Удалить">🗑️</button></div></div>)}</div>}
                  <div className="add-image-form"><input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL фотографии" onKeyPress={e => e.key === 'Enter' && url.trim() && (setForm({ ...form, imgs: [...form.imgs, url] }), setUrl(''))} /><button type="button" className="btn-primary" onClick={() => { if (url.trim()) { setForm({ ...form, imgs: [...form.imgs, url] }); setUrl('') } }}>+ Добавить фото</button></div>
                </div>
              </div>
            </div>
            <div className="modal-body-preview">
              <div className="preview-card">
                <div className="preview-gallery">
                  <img src={form.imgs[imgIdx] || '/placeholder.png'} alt={form.title} className="preview-image-large" />
                  {form.imgs.length > 1 && (<>
                    <button className="preview-nav-button preview-nav-prev" onClick={() => setImgIdx(i => (i > 0 ? i - 1 : form.imgs.length - 1))}>‹</button>
                    <button className="preview-nav-button preview-nav-next" onClick={() => setImgIdx(i => (i < form.imgs.length - 1 ? i + 1 : 0))}>›</button>
                    <div className="preview-indicators">{form.imgs.map((_, idx) => <button key={idx} className={`preview-indicator ${idx === imgIdx ? 'preview-indicator-active' : ''}`} onClick={() => setImgIdx(idx)} />)}</div>
                  </>)}
                </div>
                <div className="preview-details">
                  <h2 className="preview-title">{form.title || '(название товара)'}</h2>
                  <div className="preview-info"><p className="preview-category">Категория: {form.catName}</p><p className="preview-price">{form.price.toLocaleString('de-DE')} €</p></div>
                  <div className="preview-rating"><span>★★★★★ (15 отзывов)</span></div>
                  {form.desc && <div className="preview-description-section"><h3 className="preview-description-title">Описание</h3><p className="preview-description">{form.desc}</p></div>}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setEdit(null); setForm(null) }}>Отменить</button>
            <button className="btn-primary" onClick={saveEdit} disabled={saving}>{saving ? '💾 Сохранение...' : '💾 Сохранить'}</button>
          </div>
        </Modal>
      )}

      {(adding && form) && (
        <Modal title="➕ Добавление нового товара" onClose={() => { setAdding(false); setForm(null) }} big>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Название товара</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Введите название" /></div>
              <div className="form-group"><label>Цена (€)</label><input type="text" inputMode="decimal" value={form.price === 0 ? '' : String(form.price)} onChange={e => setForm({ ...form, price: toNum(e.target.value.replace(/[^0-9.]/g, '')) })} onBlur={e => { if (!e.target.value) setForm({ ...form, price: 0 }) }} placeholder="Введите цену" /></div>
              <div className="form-group">
                <label>Категория</label>
                <select value={form.catId ?? ''} onChange={e => { const c = cats.find(x => x.id === +e.target.value); if (c) setForm({ ...form, catName: c.name, catId: c.id }) }} style={{ width: '100%', padding: '10px', background: '#1a2332', color: '#c8c8d8', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '8px' }}>
                  <option value="" disabled>Выберите категорию</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Описание</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={4} placeholder="Введите описание" /></div>
              <div className="form-group">
                <label>Изображение (URL)</label>
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                <button type="button" className="btn-primary" onClick={() => { if (url.trim()) { setForm({ ...form, imgs: [...form.imgs, url] }); setUrl('') } }}>+ Добавить фото</button>
              </div>
              {form.imgs.length > 0 && <div className="images-list">{form.imgs.map((img, i) => <div key={i} className="image-item"><img src={img} alt="" style={{ maxHeight: '80px' }} /><button className="btn-image-delete" onClick={() => setForm({ ...form, imgs: form.imgs.filter((_, j) => j !== i) })}>🗑️</button></div>)}</div>}
            </div>
            <div className="modal-body-preview">
              <div className="preview-card">
                <div className="preview-gallery"><img src={form.imgs[imgIdx] || '/placeholder.png'} alt={form.title || 'товар'} className="preview-image-large" /></div>
                <div className="preview-details">
                  <h2 className="preview-title">{form.title || '(название товара)'}</h2>
                  <div className="preview-info"><p className="preview-category">Категория: {form.catName}</p><p className="preview-price">{form.price.toLocaleString('de-DE')} €</p></div>
                  {form.desc && <div className="preview-description-section"><h3 className="preview-description-title">Описание</h3><p className="preview-description">{form.desc}</p></div>}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setAdding(false); setForm(null) }}>Отменить</button>
            <button className="btn-primary" onClick={create} disabled={saving}>{saving ? '✅ Создание...' : '✅ Создать товар'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function RoomsTab({ items, del, load }: { items: Room[]; del: (c: ConfirmDelete) => void; load: () => Promise<void> }) {
  const [edit, setEdit] = useState<Room | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<{ title: string; price: number; desc: string; imgs: string[]; amenities: string[] } | null>(null)
  const [url, setUrl] = useState('')
  const [amenity, setAmenity] = useState('')
  const [saving, setSaving] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  const openEdit = (r: Room) => { setEdit(r); setForm({ title: r.title, price: r.price, desc: r.description, imgs: r.images || [], amenities: r.amenities || [] }); setUrl(''); setAmenity(''); setImgIdx(0) }

  const saveEdit = async () => {
    if (!edit || !form) return; setSaving(true)
    try {
      await roomApi.update(edit.id, {
        id: edit.id, title: form.title, price: form.price,
        description: form.desc, images: form.imgs, amenities: form.amenities,
      })
      await load(); setEdit(null); setForm(null)
    }
    catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  const create = async () => {
    if (!form) return; setSaving(true)
    try {
      await roomApi.create({
        id: 0, title: form.title, price: form.price,
        description: form.desc, images: form.imgs, amenities: form.amenities,
      })
      await load(); setAdding(false); setForm(null)
    }
    catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  return (
    <div className="admin-tab">
      <div className="tab-header"><h2>🏨 Управление номерами</h2><button className="btn-primary" onClick={() => { setForm({ title: '', price: 0, desc: '', imgs: [], amenities: [] }); setAdding(true) }}>+ Добавить номер</button></div>
      <div className="items-table"><table>
        <thead><tr><th>ID</th><th>Название</th><th>Цена/ночь</th><th>Описание</th><th>Действия</th></tr></thead>
        <tbody>{items.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.title}</td><td>€{r.price}</td><td className="description-cell">{(r.description || '').substring(0, 50)}...</td><td className="action-cell"><button className="btn-small btn-edit" onClick={() => openEdit(r)}>✏️ Редакт.</button><button className="btn-small btn-delete" onClick={() => del({ type: 'room', id: r.id, name: r.title })}>🗑️ Удалить</button></td></tr>)}</tbody>
      </table></div>

      {(edit && form) && (
        <Modal title="✏️ Редактирование номера" onClose={() => { setEdit(null); setForm(null) }} big>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Название номера</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Введите название" /></div>
              <div className="form-group"><label>Цена за ночь (€)</label><input type="text" inputMode="decimal" value={form.price === 0 ? '' : String(form.price)} onChange={e => setForm({ ...form, price: toNum(e.target.value.replace(/[^0-9.]/g, '')) })} onBlur={e => { if (!e.target.value) setForm({ ...form, price: 0 }) }} placeholder="Введите цену" /></div>
              <div className="form-group"><label>Описание номера</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3} placeholder="Введите описание" /></div>
              <div className="form-group">
                <label>Удобства номера</label>
                <div className="amenities-manager">
                  {form.amenities.length > 0 && <div className="amenities-list">{form.amenities.map((a, i) => <div key={i} className="amenity-item"><span>{a}</span><button type="button" className="btn-amenity-delete" onClick={() => setForm({ ...form, amenities: form.amenities.filter((_, j) => j !== i) })}>✗</button></div>)}</div>}
                  <div className="add-amenity-form"><input type="text" value={amenity} onChange={e => setAmenity(e.target.value)} placeholder="Новое удобство" onKeyPress={e => e.key === 'Enter' && amenity.trim() && (setForm({ ...form, amenities: [...form.amenities, amenity.trim()] }), setAmenity(''))} /><button type="button" className="btn-primary" onClick={() => { if (amenity.trim()) { setForm({ ...form, amenities: [...form.amenities, amenity.trim()] }); setAmenity('') } }}>+ Добавить</button></div>
                </div>
              </div>
              <div className="form-group">
                <label>Фотографии номера</label>
                <div className="images-manager">
                  {form.imgs.length > 0 && <div className="images-list">{form.imgs.map((img, i) => <div key={i} className="image-item"><img src={img} alt="" /><div className="image-controls"><button type="button" className="btn-image-delete" onClick={() => setForm({ ...form, imgs: form.imgs.filter((_, j) => j !== i) })} title="Удалить">🗑️</button></div></div>)}</div>}
                  <div className="add-image-form"><input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL фотографии" onKeyPress={e => e.key === 'Enter' && url.trim() && (setForm({ ...form, imgs: [...form.imgs, url] }), setUrl(''))} /><button type="button" className="btn-primary" onClick={() => { if (url.trim()) { setForm({ ...form, imgs: [...form.imgs, url] }); setUrl('') } }}>+ Добавить фото</button></div>
                </div>
              </div>
            </div>
            <div className="modal-body-preview">
              <div className="preview-card preview-card-room">
                <div className="preview-gallery">
                  <img src={form.imgs[imgIdx] || (edit.images[0] ?? '/placeholder.png')} alt={form.title} className="preview-image-large" />
                  {form.imgs.length > 1 && (<>
                    <button className="preview-nav-button preview-nav-prev" onClick={() => setImgIdx(i => (i > 0 ? i - 1 : form.imgs.length - 1))}>‹</button>
                    <button className="preview-nav-button preview-nav-next" onClick={() => setImgIdx(i => (i < form.imgs.length - 1 ? i + 1 : 0))}>›</button>
                    <div className="preview-indicators">{form.imgs.map((_, idx) => <button key={idx} className={`preview-indicator ${idx === imgIdx ? 'preview-indicator-active' : ''}`} onClick={() => setImgIdx(idx)} />)}</div>
                  </>)}
                </div>
                <div className="preview-details">
                  <div className="room-preview-header"><div><h2 className="preview-title">{form.title || '(название номера)'}</h2><p className="room-preview-desc">{form.desc}</p></div><div className="room-preview-price"><span className="room-preview-price-value">€{form.price}</span><span className="room-preview-price-unit">/ ночь</span></div></div>
                  {form.amenities.length > 0 && <div className="room-preview-amenities"><h3>Удобства</h3><div className="amenities-grid">{form.amenities.map((a, i) => <div key={i} className="amenity-badge"><span className="amenity-check">✓</span>{a}</div>)}</div></div>}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setEdit(null); setForm(null) }}>Отменить</button>
            <button className="btn-primary" onClick={saveEdit} disabled={saving}>{saving ? '💾 Сохранение...' : '💾 Сохранить'}</button>
          </div>
        </Modal>
      )}

      {(adding && form) && (
        <Modal title="➕ Добавление нового номера" onClose={() => { setAdding(false); setForm(null) }} big>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Название номера</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Введите название" /></div>
              <div className="form-group"><label>Цена за ночь (€)</label><input type="text" inputMode="decimal" value={form.price === 0 ? '' : String(form.price)} onChange={e => setForm({ ...form, price: toNum(e.target.value.replace(/[^0-9.]/g, '')) })} onBlur={e => { if (!e.target.value) setForm({ ...form, price: 0 }) }} placeholder="Введите цену" /></div>
              <div className="form-group"><label>Описание</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3} placeholder="Введите описание" /></div>
              <div className="form-group">
                <label>Удобства</label>
                <div className="add-amenity-form"><input type="text" value={amenity} onChange={e => setAmenity(e.target.value)} placeholder="Новое удобство" /><button type="button" className="btn-primary" onClick={() => { if (amenity.trim()) { setForm({ ...form, amenities: [...form.amenities, amenity.trim()] }); setAmenity('') } }}>+ Добавить удобство</button></div>
                {form.amenities.length > 0 && <div className="amenities-list">{form.amenities.map((a, i) => <div key={i} className="amenity-item"><span>{a}</span><button type="button" className="btn-amenity-delete" onClick={() => setForm({ ...form, amenities: form.amenities.filter((_, j) => j !== i) })}>✗</button></div>)}</div>}
              </div>
              <div className="form-group">
                <label>Изображение (URL)</label>
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                <button type="button" className="btn-primary" onClick={() => { if (url.trim()) { setForm({ ...form, imgs: [...form.imgs, url] }); setUrl('') } }}>+ Добавить фото</button>
                {form.imgs.length > 0 && <div className="images-list">{form.imgs.map((img, i) => <div key={i} className="image-item"><img src={img} alt="" style={{ maxHeight: '80px' }} /><button className="btn-image-delete" onClick={() => setForm({ ...form, imgs: form.imgs.filter((_, j) => j !== i) })}>🗑️</button></div>)}</div>}
              </div>
            </div>
            <div className="modal-body-preview">
              <div className="preview-card preview-card-room">
                <div className="preview-gallery"><img src={form.imgs[imgIdx] || '/placeholder.png'} alt={form.title || 'номер'} className="preview-image-large" /></div>
                <div className="preview-details">
                  <div className="room-preview-header"><div><h2 className="preview-title">{form.title || '(название номера)'}</h2><p className="room-preview-desc">{form.desc}</p></div><div className="room-preview-price"><span className="room-preview-price-value">€{form.price}</span><span className="room-preview-price-unit">/ ночь</span></div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setAdding(false); setForm(null) }}>Отменить</button>
            <button className="btn-primary" onClick={create} disabled={saving}>{saving ? '✅ Создание...' : '✅ Создать номер'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function MenusTab({ items, del, load }: { items: Dish[]; del: (c: ConfirmDelete) => void; load: () => Promise<void> }) {
  const [edit, setEdit] = useState<Dish | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<{ name: string; price: number; desc: string } | null>(null)
  const [day, setDay] = useState<DayOfWeek>('Monday')
  const [meal, setMeal] = useState<MealType>('Breakfast')
  const [saving, setSaving] = useState(false)
  const filtered = items.filter(d => d.dayOfWeek === day && d.meal === meal)

  const saveEdit = async () => {
    if (!edit || !form) return; setSaving(true)
    try { await dishApi.update({ id: edit.id, dayOfWeek: edit.dayOfWeek, meal: edit.meal, name: form.name, description: form.desc || undefined, price: form.price, isActive: true }); await load(); setEdit(null); setForm(null) }
    catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }
  const create = async () => {
    if (!form) return; setSaving(true)
    try { await dishApi.create({ id: 0, dayOfWeek: day, meal, name: form.name, description: form.desc || undefined, price: form.price, isActive: true }); await load(); setAdding(false); setForm(null) }
    catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  return (
    <div className="admin-tab">
      <div className="tab-header"><h2>🍽️ Управление меню</h2><button className="btn-primary" onClick={() => { setForm({ name: '', price: 0, desc: '' }); setAdding(true) }}>+ Добавить блюдо</button></div>
      <div className="menu-filters" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>День недели</label>
          <select value={day} onChange={e => setDay(e.target.value as DayOfWeek)} style={{ width: '100%', padding: '10px', background: '#1a2332', color: '#c8c8d8', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '8px' }}>
            {Object.entries(DAY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Приём пищи</label>
          <select value={meal} onChange={e => setMeal(e.target.value as MealType)} style={{ width: '100%', padding: '10px', background: '#1a2332', color: '#c8c8d8', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '8px' }}>
            {MEAL_ORDER.map(m => <option key={m} value={m}>{mealTypeLabels[m]}</option>)}
          </select>
        </div>
      </div>
      <div className="items-table"><table>
        <thead><tr><th>ID</th><th>Название</th><th>Цена</th><th>Действия</th></tr></thead>
        <tbody>{filtered.map(d => <tr key={d.id}><td>{d.id}</td><td>{d.name}</td><td>{d.price} €</td><td className="action-cell"><button className="btn-small btn-edit" onClick={() => { setEdit(d); setForm({ name: d.name, price: d.price, desc: d.description || '' }) }}>✏️ Редакт.</button><button className="btn-small btn-delete" onClick={() => del({ type: 'dish', id: d.id, name: d.name })}>🗑️ Удалить</button></td></tr>)}
        {filtered.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#888' }}>Нет блюд на {DAY_LABELS[day].toLowerCase()} ({mealTypeLabels[meal].toLowerCase()})</td></tr>}
        </tbody>
      </table></div>

      {(edit && form) && (
        <Modal title="✏️ Редактирование блюда" onClose={() => { setEdit(null); setForm(null) }}>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Название блюда</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Введите название" /></div>
              <div className="form-group"><label>Цена (€)</label><input type="text" inputMode="decimal" value={form.price === 0 ? '' : String(form.price)} onChange={e => setForm({ ...form, price: toNum(e.target.value.replace(/[^0-9.]/g, '')) })} onBlur={e => { if (!e.target.value) setForm({ ...form, price: 0 }) }} placeholder="Введите цену" /></div>
              <div className="form-group"><label>Описание</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3} placeholder="Введите описание" /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setEdit(null); setForm(null) }}>Отменить</button>
            <button className="btn-primary" onClick={saveEdit} disabled={saving}>{saving ? '💾 Сохранение...' : '💾 Сохранить'}</button>
          </div>
        </Modal>
      )}

      {(adding && form) && (
        <Modal title="➕ Добавление нового блюда" onClose={() => { setAdding(false); setForm(null) }}>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Название блюда</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Введите название" /></div>
              <div className="form-group"><label>Цена (€)</label><input type="text" inputMode="decimal" value={form.price === 0 ? '' : String(form.price)} onChange={e => setForm({ ...form, price: toNum(e.target.value.replace(/[^0-9.]/g, '')) })} onBlur={e => { if (!e.target.value) setForm({ ...form, price: 0 }) }} placeholder="Введите цену" /></div>
              <div className="form-group"><label>Описание</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3} placeholder="Введите описание" /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setAdding(false); setForm(null) }}>Отменить</button>
            <button className="btn-primary" onClick={create} disabled={saving}>{saving ? '✅ Создание...' : '✅ Создать блюдо'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function UsersTab({ items, load }: { items: UserProfile[]; del: (c: ConfirmDelete) => void; load: () => Promise<void> }) {
  const [edit, setEdit] = useState<UserProfile | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<{ username: string; email: string; password: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'id' | 'username' | 'email'>('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const saveEdit = async () => {
    if (!edit || !form) return; setSaving(true)
    try {
      await userApi.update(edit.id, { username: form.username, email: form.email, isActive: edit.isActive })
      await load(); setEdit(null); setForm(null)
    } catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  const toggleActive = async (u: UserProfile) => {
    try {
      await userApi.activate(u.id, !u.isActive)
      await load()
    } catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) }
  }

  const create = async () => {
    if (!form) return; setSaving(true)
    try {
      await userApi.create({ username: form.username, email: form.email, password: form.password })
      await load(); setAdding(false); setForm(null)
    } catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  const activeUsers = items.filter(u => u.isActive).length
  const inactiveUsers = items.length - activeUsers

  const filtered = items
    .filter(u => {
      if (statusFilter === 'active') return u.isActive
      if (statusFilter === 'inactive') return !u.isActive
      return true
    })
    .filter(u => {
      if (roleFilter === 'all') return true
      const role = u.role
      const roleStr = typeof role === 'number'
        ? (role === 1 ? 'admin' : 'user')
        : String(role ?? '').toLowerCase()
      return roleStr === roleFilter
    })
    .filter(u => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'id') return (a.id - b.id) * dir
      if (sortBy === 'username') return a.username.localeCompare(b.username) * dir
      return a.email.localeCompare(b.email) * dir
    })

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const sortArrow = (col: typeof sortBy) => {
    if (sortBy !== col) return ''
    return sortDir === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>👥 Управление пользователями</h2>
        <button className="btn-primary" onClick={() => { setForm({ username: '', email: '', password: '' }); setAdding(true) }}>+ Добавить пользователя</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '25px' }}>
        <div className="stat-card"><h3>Всего пользователей</h3><p className="stat-number">{items.length}</p></div>
        <div className="stat-card"><h3>Активных</h3><p className="stat-number">{activeUsers}</p></div>
        <div className="stat-card"><h3>Неактивных</h3><p className="stat-number">{inactiveUsers}</p></div>
      </div>

      <div className="users-toolbar">
        <div className="users-search">
          <span className="users-search-icon">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="users-search-input"
          />
          {search && <button className="users-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="users-filter-select"
        >
          <option value="all">Все статусы</option>
          <option value="active">🟢 Активные</option>
          <option value="inactive">🔴 Неактивные</option>
        </select>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
          className="users-filter-select"
        >
          <option value="all">Все роли</option>
          <option value="admin">👑 Админ</option>
          <option value="user">👤 Пользователь</option>
        </select>
      </div>

      <div className="items-table"><table>
        <thead><tr>
          <th className="users-th-sortable" onClick={() => toggleSort('id')}>ID{sortArrow('id')}</th>
          <th className="users-th-sortable" onClick={() => toggleSort('username')}>Имя{sortArrow('username')}</th>
          <th className="users-th-sortable" onClick={() => toggleSort('email')}>Email{sortArrow('email')}</th>
          <th>Статус</th>
          <th>Роль</th>
          <th>Действия</th>
        </tr></thead>
        <tbody>{filtered.map(u => <tr key={u.id} className={!u.isActive ? 'user-row-inactive' : ''}>
          <td>{u.id}</td>
          <td>{u.username}</td>
          <td>{u.email}</td>
          <td><span className={`user-status-badge ${u.isActive ? 'user-status-badge-active' : 'user-status-badge-inactive'}`}>{u.isActive ? 'Активен' : 'Неактивен'}</span></td>
          <td><span className={`user-status-badge ${(typeof u.role === 'number' ? (u.role === 1 ? 'admin' : 'user') : String(u.role ?? '').toLowerCase()) === 'admin' ? 'user-status-badge-admin' : 'user-status-badge-user'}`}>{(typeof u.role === 'number' ? (u.role === 1 ? '👑 Админ' : '👤 Пользователь') : String(u.role ?? '').toLowerCase() === 'admin' ? '👑 Админ' : '👤 Пользователь')}</span></td>
          <td className="action-cell">
            <button className="btn-small btn-edit" onClick={() => { setEdit(u); setForm({ username: u.username, email: u.email, password: '' }) }}>✏️ Редакт.</button>
            {u.isActive ? (
              <button className="btn-small btn-delete" style={{ minWidth: '130px' }} onClick={() => toggleActive(u)}>🚫 Деакт.</button>
            ) : (
              <button className="btn-small btn-success" style={{ minWidth: '130px' }} onClick={() => toggleActive(u)}>✅ Акт.</button>
            )}
          </td>
        </tr>)}
        {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#888' }}>Пользователи не найдены</td></tr>}
        </tbody>
      </table></div>

      {filtered.length > 0 && <div className="users-count">Показано: {filtered.length} из {items.length}</div>}

      {(edit && form) && (
        <Modal title="✏️ Редактирование пользователя" onClose={() => { setEdit(null); setForm(null) }}>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Имя пользователя</label><input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Введите имя" /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Введите email" /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setEdit(null); setForm(null) }}>Отменить</button>
            <button className="btn-primary" onClick={saveEdit} disabled={saving}>{saving ? '💾 Сохранение...' : '💾 Сохранить'}</button>
          </div>
        </Modal>
      )}

      {(adding && form) && (
        <Modal title="➕ Добавление нового пользователя" onClose={() => { setAdding(false); setForm(null) }}>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Имя пользователя</label><input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Введите имя" /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Введите email" /></div>
              <div className="form-group"><label>Пароль</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Минимум 8 символов" /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setAdding(false); setForm(null) }}>Отменить</button>
            <button className="btn-primary" onClick={create} disabled={saving}>{saving ? '✅ Создание...' : '✅ Создать пользователя'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AttractionsTab({ items, cats, del, load }: { items: AttractionBackendDto[]; cats: CategoryDto[]; del: (c: ConfirmDelete) => void; load: () => Promise<void> }) {
  const [edit, setEdit] = useState<AttractionBackendDto | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<{
    name: string; shortDesc: string; desc: string; catId: number | null; address: string;
    lat: number; lng: number; dist: number; price: number; imgs: string[];
    phone: string; email: string; bookingUrl: string
  } | null>(null)
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const [latStr, setLatStr] = useState('')
  const [lngStr, setLngStr] = useState('')

  const openEdit = (a: AttractionBackendDto) => {
    setEdit(a)
    const latVal = (a as any).location?.latitude || 0;
    const lngVal = (a as any).location?.longitude || 0;
    setForm({
      name: a.name, shortDesc: a.shortDescription || '', desc: a.description || '',
      catId: a.category ? (cats.find(c => c.name === a.category)?.id ?? null) : null,
      address: a.address || '', lat: latVal, lng: lngVal,
      dist: a.distance, price: a.price, imgs: (a.images || []).map(i => i.url),
      phone: a.contacts?.phone || '', email: a.contacts?.email || '', bookingUrl: a.contacts?.bookingUrl || '',
    })
    setLatStr(latVal === 0 ? '' : String(latVal));
    setLngStr(lngVal === 0 ? '' : String(lngVal));
    setUrl(''); setImgIdx(0)
  }

  const saveEdit = async () => {
    if (!edit || !form) return; setSaving(true)
    try {
      await attractionApi.update(edit.id, {
        id: edit.id, name: form.name, shortDescription: form.shortDesc, description: form.desc,
        categoryId: form.catId,
        location: { address: form.address, latitude: form.lat, longitude: form.lng },
        distance: form.dist, price: form.price, images: form.imgs.map(u => ({ url: u })),
        openingHours: (edit.openingHours || []).length > 0 ? edit.openingHours : [{ dayOfWeek: 1, start: '09:00', end: '18:00' }] as OpeningHour[],
        contacts: { phone: form.phone, email: form.email, bookingUrl: form.bookingUrl }, isActive: true,
      } as any)
      await load(); setEdit(null); setForm(null)
    } catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  const create = async () => {
    if (!form) return; setSaving(true)
    try {
      await attractionApi.create({
        name: form.name, shortDescription: form.shortDesc, description: form.desc,
        categoryId: form.catId,
        location: { address: form.address, latitude: form.lat, longitude: form.lng },
        distance: form.dist, price: form.price, images: form.imgs.map(u => ({ url: u })),
        openingHours: [{ dayOfWeek: 1, start: '09:00', end: '18:00' }] as OpeningHour[],
        contacts: { phone: form.phone, email: form.email, bookingUrl: form.bookingUrl },
      } as any)
      await load(); setAdding(false); setForm(null)
    } catch (e: any) { alert('Ошибка: ' + (e?.response?.data?.message || e?.message)) } finally { setSaving(false) }
  }

  return (
    <div className="admin-tab">
      <div className="tab-header"><h2>🗺️ Управление достопримечательностями</h2><button className="btn-primary" onClick={() => { setForm({ name: '', shortDesc: '', desc: '', catId: null, address: '', lat: 43.55, lng: 7.01, dist: 0, price: 0, imgs: [], phone: '', email: '', bookingUrl: '' }); setLatStr(''); setLngStr(''); setAdding(true) }}>+ Добавить достопримечательность</button></div>
      <div className="items-table"><table>
        <thead><tr><th>ID</th><th>Название</th><th>Цена</th><th>Рейтинг</th><th>Действия</th></tr></thead>
        <tbody>{items.map(a => <tr key={a.id}><td>{a.id}</td><td>{a.name}</td><td>{a.price} €</td><td>⭐ {a.rating}</td><td className="action-cell"><button className="btn-small btn-edit" onClick={() => openEdit(a)}>✏️ Редакт.</button><button className="btn-small btn-delete" onClick={() => del({ type: 'attraction', id: a.id, name: a.name })}>🗑️ Удалить</button></td></tr>)}</tbody>
      </table></div>

      {(edit && form) && (
        <Modal title="✏️ Редактирование достопримечательности" onClose={() => { setEdit(null); setForm(null); setLatStr(''); setLngStr('') }} big>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Название</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Введите название" /></div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label>Цена (€)</label><input type="text" inputMode="decimal" value={form.price === 0 ? '' : String(form.price)} onChange={e => setForm({ ...form, price: toNum(e.target.value.replace(/[^0-9.]/g, '')) })} onBlur={e => { if (!e.target.value) setForm({ ...form, price: 0 }) }} placeholder="Введите цену" /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Расстояние (км)</label><input type="text" inputMode="decimal" value={form.dist === 0 ? '' : String(form.dist)} onChange={e => setForm({ ...form, dist: toNum(e.target.value.replace(/[^0-9.]/g, '')) })} onBlur={e => { if (!e.target.value) setForm({ ...form, dist: 0 }) }} placeholder="0" /></div>
              </div>
              <div className="form-group"><label>Адрес</label><input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Введите адрес" /></div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label>Широта (Latitude)</label><input type="text" inputMode="decimal" value={latStr} onChange={e => { const filtered = e.target.value.replace(/[^0-9.-]/g, ''); setLatStr(filtered); const n = parseFloat(filtered); if (!isNaN(n) && n >= -90 && n <= 90) setForm({ ...form, lat: n }); }} onBlur={e => { if (!e.target.value) { setLatStr(''); setForm({ ...form, lat: 0 }) } }} placeholder="43.55" /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Долгота (Longitude)</label><input type="text" inputMode="decimal" value={lngStr} onChange={e => { const filtered = e.target.value.replace(/[^0-9.-]/g, ''); setLngStr(filtered); const n = parseFloat(filtered); if (!isNaN(n) && n >= -180 && n <= 180) setForm({ ...form, lng: n }); }} onBlur={e => { if (!e.target.value) { setLngStr(''); setForm({ ...form, lng: 0 }) } }} placeholder="7.01" /></div>
              </div>
              <div className="form-group"><label>Категория</label>
                <select value={form.catId ?? ''} onChange={e => setForm({ ...form, catId: e.target.value ? +e.target.value : null })} style={{ width: '100%', padding: '10px', background: '#1a2332', color: '#c8c8d8', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '8px' }}>
                  <option value="">Без категории</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Краткое описание</label><textarea value={form.shortDesc} onChange={e => setForm({ ...form, shortDesc: e.target.value })} rows={2} placeholder="Введите краткое описание" /></div>
              <div className="form-group"><label>Полное описание</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={4} placeholder="Введите полное описание" /></div>
              <div className="form-group"><label>Контактный телефон</label><input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+33 4 93 00 00 01" /></div>
              <div className="form-group"><label>Email</label><input type="text" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="example@domain.com" /></div>
              <div className="form-group"><label>URL бронирования</label><input type="text" value={form.bookingUrl} onChange={e => setForm({ ...form, bookingUrl: e.target.value })} placeholder="https://..." /></div>
              <div className="form-group">
                <label>Фотографии</label>
                <div className="images-manager">
                  {form.imgs.length > 0 && <div className="images-list">{form.imgs.map((img, i) => <div key={i} className="image-item"><img src={img} alt="" /><div className="image-controls"><button type="button" className="btn-image-delete" onClick={() => setForm({ ...form, imgs: form.imgs.filter((_, j) => j !== i) })}>🗑️</button></div></div>)}</div>}
                  <div className="add-image-form"><input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL фотографии" onKeyPress={e => e.key === 'Enter' && url.trim() && (setForm({ ...form, imgs: [...form.imgs, url] }), setUrl(''))} /><button type="button" className="btn-primary" onClick={() => { if (url.trim()) { setForm({ ...form, imgs: [...form.imgs, url] }); setUrl('') } }}>+ Добавить фото</button></div>
                </div>
              </div>
            </div>
            <div className="modal-body-preview">
              <div className="preview-card">
                <div className="preview-gallery">
                  <img src={form.imgs[imgIdx] || '/placeholder.png'} alt={form.name} className="preview-image-large" />
                  {form.imgs.length > 1 && (<>
                    <button className="preview-nav-button preview-nav-prev" onClick={() => setImgIdx(i => (i > 0 ? i - 1 : form.imgs.length - 1))}>‹</button>
                    <button className="preview-nav-button preview-nav-next" onClick={() => setImgIdx(i => (i < form.imgs.length - 1 ? i + 1 : 0))}>›</button>
                    <div className="preview-indicators">{form.imgs.map((_, idx) => <button key={idx} className={`preview-indicator ${idx === imgIdx ? 'preview-indicator-active' : ''}`} onClick={() => setImgIdx(idx)} />)}</div>
                  </>)}
                </div>
                <div className="preview-details">
                  <h2 className="preview-title">{form.name || '(название)'}</h2>
                  <div className="preview-info"><p className="preview-category">{form.address}</p><p className="preview-price">{form.price} €</p></div>
                  {form.shortDesc && <div className="preview-description-section"><h3 className="preview-description-title">Описание</h3><p className="preview-description">{form.shortDesc}</p></div>}
                  {(form.phone || form.email) && <div className="preview-description-section"><h3 className="preview-description-title">Контакты</h3><div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#c8c8d8', fontSize: '14px' }}>{form.phone && <p style={{ margin: 0 }}>📱 {form.phone}</p>}{form.email && <p style={{ margin: 0 }}>📧 {form.email}</p>}</div></div>}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setEdit(null); setForm(null) }}>Отменить</button>
            <button className="btn-primary" onClick={saveEdit} disabled={saving}>{saving ? '💾 Сохранение...' : '💾 Сохранить'}</button>
          </div>
        </Modal>
      )}

      {(adding && form) && (
        <Modal title="➕ Добавление новой достопримечательности" onClose={() => { setAdding(false); setForm(null); setLatStr(''); setLngStr('') }} big>
          <div className="modal-body">
            <div className="modal-body-form">
              <div className="form-group"><label>Название</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Введите название" /></div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label>Цена (€)</label><input type="text" inputMode="decimal" value={form.price === 0 ? '' : String(form.price)} onChange={e => setForm({ ...form, price: toNum(e.target.value.replace(/[^0-9.]/g, '')) })} onBlur={e => { if (!e.target.value) setForm({ ...form, price: 0 }) }} placeholder="Введите цену" /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Расстояние (км)</label><input type="text" inputMode="decimal" value={form.dist === 0 ? '' : String(form.dist)} onChange={e => setForm({ ...form, dist: toNum(e.target.value.replace(/[^0-9.]/g, '')) })} onBlur={e => { if (!e.target.value) setForm({ ...form, dist: 0 }) }} placeholder="0" /></div>
              </div>
              <div className="form-group"><label>Адрес</label><input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Введите адрес" /></div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label>Широта (Latitude)</label><input type="text" inputMode="decimal" value={latStr} onChange={e => { const filtered = e.target.value.replace(/[^0-9.-]/g, ''); setLatStr(filtered); const n = parseFloat(filtered); if (!isNaN(n) && n >= -90 && n <= 90) setForm({ ...form, lat: n }); }} onBlur={e => { if (!e.target.value) { setLatStr(''); setForm({ ...form, lat: 0 }) } }} placeholder="43.55" /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Долгота (Longitude)</label><input type="text" inputMode="decimal" value={lngStr} onChange={e => { const filtered = e.target.value.replace(/[^0-9.-]/g, ''); setLngStr(filtered); const n = parseFloat(filtered); if (!isNaN(n) && n >= -180 && n <= 180) setForm({ ...form, lng: n }); }} onBlur={e => { if (!e.target.value) { setLngStr(''); setForm({ ...form, lng: 0 }) } }} placeholder="7.01" /></div>
              </div>
              <div className="form-group"><label>Категория</label>
                <select value={form.catId ?? ''} onChange={e => setForm({ ...form, catId: e.target.value ? +e.target.value : null })} style={{ width: '100%', padding: '10px', background: '#1a2332', color: '#c8c8d8', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '8px' }}>
                  <option value="">Без категории</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Краткое описание</label><textarea value={form.shortDesc} onChange={e => setForm({ ...form, shortDesc: e.target.value })} rows={2} placeholder="Введите краткое описание" /></div>
              <div className="form-group"><label>Полное описание</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={4} placeholder="Введите полное описание" /></div>
              <div className="form-group"><label>Телефон</label><input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+33 4 93 00 00 01" /></div>
              <div className="form-group"><label>Email</label><input type="text" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="example@domain.com" /></div>
              <div className="form-group"><label>URL бронирования</label><input type="text" value={form.bookingUrl} onChange={e => setForm({ ...form, bookingUrl: e.target.value })} placeholder="https://..." /></div>
              <div className="form-group">
                <label>Фотографии</label>
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                <button type="button" className="btn-primary" onClick={() => { if (url.trim()) { setForm({ ...form, imgs: [...form.imgs, url] }); setUrl('') } }}>+ Добавить фото</button>
                {form.imgs.length > 0 && <div className="images-list">{form.imgs.map((img, i) => <div key={i} className="image-item"><img src={img} alt="" style={{ maxHeight: '80px' }} /><button className="btn-image-delete" onClick={() => setForm({ ...form, imgs: form.imgs.filter((_, j) => j !== i) })}>🗑️</button></div>)}</div>}
              </div>
            </div>
            <div className="modal-body-preview">
              <div className="preview-card">
                <div className="preview-gallery"><img src={form.imgs[imgIdx] || '/placeholder.png'} alt={form.name || 'достопримечательность'} className="preview-image-large" /></div>
                <div className="preview-details">
                  <h2 className="preview-title">{form.name || '(название)'}</h2>
                  <div className="preview-info"><p className="preview-category">{form.address}</p><p className="preview-price">{form.price} €</p></div>
                  {form.shortDesc && <div className="preview-description-section"><h3 className="preview-description-title">Описание</h3><p className="preview-description">{form.shortDesc}</p></div>}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => { setAdding(false); setForm(null) }}>Отменить</button>
            <button className="btn-primary" onClick={create} disabled={saving}>{saving ? '✅ Создание...' : '✅ Создать'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}