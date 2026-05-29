import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { products } from '../data/products'
import { rooms } from '../data/rooms'
import { DAYS } from '../data/menus'
import { attractions } from '../data/attractions'
import { categoryApi } from '../api'
import type { HotelCategory } from '../types/product'
import type { Attraction } from '../types/local'
import ErrorState from '../components/ErrorState/ErrorState'
import '../styles/admin.css'

type Tab = 'products' | 'rooms' | 'menus' | 'attractions' | 'dashboard'

type ConfirmDelete = {
  type: 'product' | 'room' | 'menu' | 'attraction'
  id: number | string
  name: string
} | null

export default function Admin() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [editingProduct, setEditingProduct] = useState<(typeof products)[0] | null>(null)
  const [editingRoom, setEditingRoom] = useState<(typeof rooms)[0] | null>(null)
  const [editingMenu, setEditingMenu] = useState<(typeof DAYS)[0] | null>(null)
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isAddingRoom, setIsAddingRoom] = useState(false)
  const [newProductData, setNewProductData] = useState<{
    title: string
    price: number
    category: HotelCategory
    description: string
    images: string[]
    image: string
  } | null>(null)
  const [newProductImageIndex, setNewProductImageIndex] = useState(0)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newRoomData, setNewRoomData] = useState<{
    title: string
    price: number
    capacity: number
    size: number
    description: string
    longDescription: string
    images: string[]
    amenities: string[]
  } | null>(null)
  const [newRoomImageIndex, setNewRoomImageIndex] = useState(0)
  const [newRoomImageUrl, setNewRoomImageUrl] = useState('')
  const [isAddingAttraction, setIsAddingAttraction] = useState(false)
  const [newAttractionData, setNewAttractionData] = useState<Attraction | null>(null)
  const [newAttractionImageIndex, setNewAttractionImageIndex] = useState(0)

  useEffect(() => {
    if (editingProduct || editingRoom || editingMenu || editingAttraction || confirmDelete || isAddingProduct || isAddingRoom || isAddingAttraction) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [editingProduct, editingRoom, editingMenu, editingAttraction, confirmDelete, isAddingProduct, isAddingRoom, isAddingAttraction])

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEditingProduct(null)
        setEditingRoom(null)
        setEditingMenu(null)
        setEditingAttraction(null)
        setConfirmDelete(null)
        setIsAddingProduct(false)
        setIsAddingRoom(false)
        setIsAddingAttraction(false)
      }
    }

    if (editingProduct || editingRoom || editingMenu || editingAttraction || confirmDelete || isAddingProduct || isAddingRoom || isAddingAttraction) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => {
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }
  }, [editingProduct, editingRoom, editingMenu, editingAttraction, confirmDelete, isAddingProduct, isAddingRoom, isAddingAttraction])

  if (!user || user.role !== 'admin') {
    return (
      <ErrorState
        title="Страница не найдена"
        message={"Путь указан неверно. Проверьте адрес и попробуйте снова."}
        emoji="(x_x)"
        imageUrl="/cry.gif"
      />
    )
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Панель администратора</h1>
          <div className="admin-user-info">
            <span>{user?.name} ({user?.email})</span>
            <button className="btn-logout" onClick={logout}>
              Выход
            </button>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        <nav className="admin-nav">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Статистика
          </button>
          <button
            className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🛍️ Продукты
          </button>
          <button
            className={`nav-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            🏨 Номера
          </button>
          <button
            className={`nav-btn ${activeTab === 'menus' ? 'active' : ''}`}
            onClick={() => setActiveTab('menus')}
          >
            🍽️ Меню
          </button>
          <button
            className={`nav-btn ${activeTab === 'attractions' ? 'active' : ''}`}
            onClick={() => setActiveTab('attractions')}
          >
            🗺️ Гид по городу
          </button>
        </nav>

        <main className="admin-main">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'products' && (
            <ProductsTab 
              editingProduct={editingProduct} 
              setEditingProduct={setEditingProduct} 
              setConfirmDelete={setConfirmDelete}
              isAddingProduct={isAddingProduct}
              setIsAddingProduct={setIsAddingProduct}
              newProductData={newProductData}
              setNewProductData={setNewProductData}
              newProductImageIndex={newProductImageIndex}
              setNewProductImageIndex={setNewProductImageIndex}
              newImageUrl={newImageUrl}
              setNewImageUrl={setNewImageUrl}
            />
          )}
          {activeTab === 'rooms' && (
            <RoomsTab 
              editingRoom={editingRoom} 
              setEditingRoom={setEditingRoom} 
              setConfirmDelete={setConfirmDelete}
              isAddingRoom={isAddingRoom}
              setIsAddingRoom={setIsAddingRoom}
              newRoomData={newRoomData}
              setNewRoomData={setNewRoomData}
              newRoomImageIndex={newRoomImageIndex}
              setNewRoomImageIndex={setNewRoomImageIndex}
              newRoomImageUrl={newRoomImageUrl}
              setNewRoomImageUrl={setNewRoomImageUrl}
            />
          )}
          {activeTab === 'menus' && <MenusTab editingMenu={editingMenu} setEditingMenu={setEditingMenu} setConfirmDelete={setConfirmDelete} />}
          {activeTab === 'attractions' && <AttractionsTab editingAttraction={editingAttraction} setEditingAttraction={setEditingAttraction} setConfirmDelete={setConfirmDelete} isAddingAttraction={isAddingAttraction} setIsAddingAttraction={setIsAddingAttraction} newAttractionData={newAttractionData} setNewAttractionData={setNewAttractionData} newAttractionImageIndex={newAttractionImageIndex} setNewAttractionImageIndex={setNewAttractionImageIndex} />}
        </main>
      </div>

      {confirmDelete && (
        <ConfirmDeleteDialog
          item={confirmDelete}
          onConfirm={() => {
            console.log(`Удалён ${confirmDelete.type}: ${confirmDelete.name}`)
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

interface ConfirmDeleteDialogProps {
  item: Exclude<ConfirmDelete, null>
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDeleteDialog({ item, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'product':
        return '🛍️'
      case 'room':
        return '🏨'
      case 'menu':
        return '🍽️'
      case 'attraction':
        return '🗺️'
    }
  }

  const getTypeLabel = () => {
    switch (item.type) {
      case 'product':
        return 'товар'
      case 'room':
        return 'номер'
      case 'menu':
        return 'меню'
      case 'attraction':
        return 'достопримечательность'
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">{getIcon()}</div>
        <h3>Подтверждение удаления</h3>
        <p>
          Вы уверены, что хотите удалить {getTypeLabel()} <strong>"{item.name}"</strong>?
        </p>
        <p className="confirm-warning">⚠️ Это действие невозможно отменить</p>
        <div className="confirm-buttons">
          <button className="btn-cancel" onClick={onCancel}>
            Отменить
          </button>
          <button className="btn-delete-confirm" onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}

function DashboardTab() {
  return (
    <div className="admin-tab">
      <h2>📊 Статистика</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Всего продуктов</h3>
          <p className="stat-number">{products.length}</p>
        </div>
        <div className="stat-card">
          <h3>Всего номеров</h3>
          <p className="stat-number">{rooms.length}</p>
        </div>
        <div className="stat-card">
          <h3>Дни меню</h3>
          <p className="stat-number">{DAYS.length}</p>
        </div>
        <div className="stat-card">
          <h3>Достопримечательности</h3>
          <p className="stat-number">{attractions.length}</p>
        </div>
        <div className="stat-card">
          <h3>Статус системы</h3>
          <p className="stat-status">🟢 Активна</p>
        </div>
      </div>
    </div>
  )
}

type ProductsTabProps = {
  editingProduct: (typeof products)[0] | null
  setEditingProduct: (product: (typeof products)[0] | null) => void
  setConfirmDelete: (item: ConfirmDelete) => void
  isAddingProduct: boolean
  setIsAddingProduct: (value: boolean) => void
  newProductData: {
    title: string
    price: number
    category: HotelCategory
    description: string
    images: string[]
    image: string
  } | null
  setNewProductData: (data: any) => void
  newProductImageIndex: number
  setNewProductImageIndex: (index: number | ((prev: number) => number)) => void
  newImageUrl: string
  setNewImageUrl: (url: string) => void
}

function ProductsTab({ 
  editingProduct, 
  setEditingProduct, 
  setConfirmDelete,
  isAddingProduct,
  setIsAddingProduct,
  newProductData,
  setNewProductData,
  newProductImageIndex,
  setNewProductImageIndex,
  newImageUrl,
  setNewImageUrl
}: ProductsTabProps) {
  const DEFAULT_CATEGORIES = ['SPA & Wellness', 'Рестораны', 'Трансфер', 'События', 'Мерч']
  const [defaultCategories, setDefaultCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [formData, setFormData] = useState(editingProduct ? {
    title: editingProduct.title,
    price: editingProduct.price,
    category: editingProduct.category,
    description: editingProduct.description || '',
    images: editingProduct.images || [],
    image: editingProduct.image,
  } : null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [newCategory, setNewCategory] = useState('')
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    categoryApi
      .getAll()
      .then((data) => {
        if (cancelled) return
        const names = data.map((c) => c.name).filter((x): x is string => typeof x === 'string' && x.length > 0)
        if (!names.length) return
        setDefaultCategories(names)
        setCategories(names)
      })
      .catch((err) => {
        console.warn('Failed to load categories:', err)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = () => {
    console.log('Сохранено:', formData)
    setEditingProduct(null)
  }

  const addImage = () => {
    if (newImageUrl.trim() && formData) {
      const newImages = [...(formData.images || []), newImageUrl]
      setFormData({
        ...formData,
        images: newImages,
        image: newImages[0]
      })
      setNewImageUrl('')
    }
  }

  const deleteImage = (index: number) => {
    if (formData) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        images: newImages,
        image: newImages.length > 0 ? newImages[0] : formData.image 
      })
    }
  }

  const moveImageUp = (index: number) => {
    if (formData && index > 0) {
      const newImages = [...formData.images]
      ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
      setFormData({
        ...formData,
        images: newImages,
        image: newImages[0] 
      })
    }
  }

  const moveImageDown = (index: number) => {
    if (formData && index < formData.images.length - 1) {
      const newImages = [...formData.images]
      ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
      setFormData({
        ...formData,
        images: newImages,
        image: newImages[0] 
      })
    }
  }

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
      setFormData(formData ? {...formData, category: newCategory as HotelCategory} : null)
      setNewCategory('')
    }
  }

  const addNewProduct = () => {
    const firstCategory = (categories[0] ?? defaultCategories[0] ?? 'Мерч') as HotelCategory

    setNewProductData({
      title: '',
      price: 0,
      category: firstCategory,
      description: '',
      images: [],
      image: '',
    })
    setIsAddingProduct(true)
    setCategoryDropdownOpen(false)
  }

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>🛍️ Управление продуктами</h2>
        <button 
          className="btn-primary"
          onClick={() => addNewProduct()}
        >
          + Добавить продукт
        </button>
      </div>

      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Описание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.title}</td>
                <td>{product.category}</td>
                <td>{product.price} €</td>
                <td className="description-cell">{(product.description || '').substring(0, 50)}...</td>
                <td className="action-cell">
                  <button className="btn-small btn-edit" onClick={() => {
                    setEditingProduct(product)
                    setFormData({
                      title: product.title,
                      price: product.price,
                      category: product.category,
                      description: product.description || '',
                      images: product.images || [],
                      image: product.images && product.images.length > 0 ? product.images[0] : product.image,
                    })
                    setNewImageUrl('')
                  }}>
                    ✏️ Редакт.
                  </button>
                  <button className="btn-small btn-delete" onClick={() => setConfirmDelete({
                    type: 'product',
                    id: product.id,
                    name: product.title,
                  })}>🗑️ Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProduct && formData && (
        <div className="modal-overlay" onClick={() => {
          setEditingProduct(null)
          setFormData(null)
          setCategoryDropdownOpen(false)
          setNewCategory('')
          setCategories(defaultCategories)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Редактирование товара</h3>
              <button className="modal-close" onClick={() => {
                setEditingProduct(null)
                setFormData(null)
                setCategoryDropdownOpen(false)
                setNewCategory('')
                setCategories(defaultCategories)
              }}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-body-form">
                <div className="form-group">
                  <label>Название товара</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Введите название"
                  />
                </div>

                <div className="form-group">
                  <label>Цена</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    placeholder="Введите цену"
                  />
                </div>

                <div className="form-group">
                  <label>Категория</label>
                  <div className="custom-dropdown">
                    <button 
                      type="button"
                      className="custom-dropdown-btn"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    >
                      {formData.category}
                      <span className="dropdown-arrow">▼</span>
                    </button>
                    {categoryDropdownOpen && (
                      <div className="custom-dropdown-menu">
                        {categories.map((cat) => (
                          <button 
                            key={cat}
                            type="button"
                            className={`dropdown-item ${formData.category === cat ? 'active' : ''}`}
                            onClick={() => {
                              setFormData({...formData, category: cat as HotelCategory})
                              setCategoryDropdownOpen(false)
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                        <div className="dropdown-divider"></div>
                        <div className="dropdown-add-category">
                          <input 
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Новая категория"
                            onClick={(e) => e.stopPropagation()}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addCategory()
                                setCategoryDropdownOpen(false)
                              }
                            }}
                          />
                          <button 
                            type="button"
                            className="dropdown-add-btn"
                            onClick={() => {
                              addCategory()
                              setCategoryDropdownOpen(false)
                            }}
                          >
                            + Добавить
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Описание</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={6}
                    placeholder="Введите описание товара"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Фотографии товара</label>
                  <div className="images-manager">
                    {formData.images && formData.images.length > 0 && (
                      <div className="images-list">
                        {formData.images.map((img, index) => (
                          <div key={index} className="image-item">
                            <img src={img} alt={`Product ${index + 1}`} />
                            <div className="image-controls">
                              {index > 0 && (
                                <button 
                                  type="button"
                                  className="btn-image-control"
                                  onClick={() => moveImageUp(index)}
                                  title="Переместить вверх"
                                >
                                  ⬆️
                                </button>
                              )}
                              {index < formData.images.length - 1 && (
                                <button 
                                  type="button"
                                  className="btn-image-control"
                                  onClick={() => moveImageDown(index)}
                                  title="Переместить вниз"
                                >
                                  ⬇️
                                </button>
                              )}
                              <button 
                                type="button"
                                className="btn-image-delete"
                                onClick={() => deleteImage(index)}
                                title="Удалить фото"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="add-image-form">
                      <input 
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Вставьте URL фотографии"
                        onKeyPress={(e) => e.key === 'Enter' && addImage()}
                      />
                      <button 
                        type="button"
                        className="btn-primary"
                        onClick={addImage}
                      >
                        + Добавить фото
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-body-preview">
                <div className="preview-card">
                  <div className="preview-gallery">
                    <img 
                      src={formData.images && formData.images.length > 0 ? formData.images[currentImageIndex] : formData.image || editingProduct.image} 
                      alt={formData.title} 
                      className="preview-image-large"
                    />
                    
                    {formData.images && formData.images.length > 1 && (
                      <>
                        <button
                          className="preview-nav-button preview-nav-prev"
                          onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : formData.images!.length - 1))}
                          aria-label="Предыдущее фото"
                        >
                          ‹
                        </button>

                        <button
                          className="preview-nav-button preview-nav-next"
                          onClick={() => setCurrentImageIndex((prev) => (prev < formData.images!.length - 1 ? prev + 1 : 0))}
                          aria-label="Следующее фото"
                        >
                          ›
                        </button>

                        <div className="preview-indicators">
                          {formData.images.map((_, index) => (
                            <button
                              key={index}
                              className={`preview-indicator ${index === currentImageIndex ? 'preview-indicator-active' : ''}`}
                              onClick={() => setCurrentImageIndex(index)}
                              aria-label={`Фото ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="preview-details">
                    <h2 className="preview-title">{formData.title || '(название товара)'}</h2>
                    
                    <div className="preview-info">
                      <p className="preview-category">Категория: {formData.category}</p>
                      <p className="preview-price">Цена: {formData.price.toLocaleString('de-DE')} €</p>
                    </div>

                    <div className="preview-rating">
                      <span>★★★★★ (15 отзывов)</span>
                    </div>

                    {formData.description && (
                      <div className="preview-description-section">
                        <h3 className="preview-description-title">Описание</h3>
                        <p className="preview-description">{formData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => {
                setEditingProduct(null)
                setFormData(null)
              }}>
                Отменить
              </button>
              <button className="btn-primary" onClick={handleSave}>
                💾 Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddingProduct && newProductData && (
        <div className="modal-overlay" onClick={() => {
          setIsAddingProduct(false)
          setNewProductData(null)
          setNewProductImageIndex(0)
          setCategoryDropdownOpen(false)
          setNewCategory('')
          setCategories(defaultCategories)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Добавление нового товара</h3>
              <button className="modal-close" onClick={() => {
                setIsAddingProduct(false)
                setNewProductData(null)
                setNewProductImageIndex(0)
                setCategoryDropdownOpen(false)
                setNewCategory('')
                setCategories(defaultCategories)
              }}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-body-form">
                <div className="form-group">
                  <label>Название товара</label>
                  <input 
                    type="text" 
                    value={newProductData.title}
                    onChange={(e) => setNewProductData({...newProductData, title: e.target.value})}
                    placeholder="Введите название"
                  />
                </div>

                <div className="form-group">
                  <label>Цена</label>
                  <input 
                    type="number" 
                    value={newProductData.price}
                    onChange={(e) => setNewProductData({...newProductData, price: parseFloat(e.target.value) || 0})}
                    placeholder="Введите цену"
                  />
                </div>

                <div className="form-group">
                  <label>Категория</label>
                  <div className="custom-dropdown">
                    <button 
                      type="button"
                      className="custom-dropdown-btn"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    >
                      {newProductData.category}
                      <span className="dropdown-arrow">▼</span>
                    </button>
                    {categoryDropdownOpen && (
                      <div className="custom-dropdown-menu">
                        {categories.map((cat) => (
                          <button 
                            key={cat}
                            type="button"
                            className={`dropdown-item ${newProductData.category === cat ? 'active' : ''}`}
                            onClick={() => {
                              setNewProductData({...newProductData, category: cat as HotelCategory})
                              setCategoryDropdownOpen(false)
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Описание</label>
                  <textarea 
                    value={newProductData.description}
                    onChange={(e) => setNewProductData({...newProductData, description: e.target.value})}
                    placeholder="Введите описание"
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Изображение (URL)</label>
                  <input 
                    type="text" 
                    value={newProductData.image}
                    onChange={(e) => setNewProductData({...newProductData, image: e.target.value})}
                    placeholder="https://..."
                  />
                  <button 
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      if (newProductData.image.trim() && !newProductData.images.includes(newProductData.image)) {
                        const newImages = [...newProductData.images, newProductData.image]
                        setNewProductData({
                          ...newProductData,
                          images: newImages
                        })
                        setNewProductImageIndex(newImages.length - 1)
                      }
                    }}
                  >
                    + Добавить фото
                  </button>
                </div>

                {newProductData.images.length > 0 && (
                  <div className="images-list">
                    <h4>Добавленные фото:</h4>
                    {newProductData.images.map((img, idx) => (
                      <div key={idx} className="image-item">
                        <img src={img} alt={`Product ${idx}`} style={{maxHeight: '80px'}} />
                        <button
                          className="btn-image-delete"
                          onClick={() => {
                            const newImages = newProductData.images.filter((_, i) => i !== idx)
                            setNewProductData({
                              ...newProductData,
                              images: newImages
                            })
                            if (newProductImageIndex >= newImages.length && newImages.length > 0) {
                              setNewProductImageIndex(newImages.length - 1)
                            }
                          }}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-body-preview">
                <div className="preview-card">
                  <div className="preview-gallery">
                    <img 
                      src={newProductData.images && newProductData.images.length > 0 ? newProductData.images[newProductImageIndex] : newProductData.image || '/placeholder.png'} 
                      alt={newProductData.title || 'товар'} 
                      className="preview-image-large"
                    />
                    
                    {newProductData.images && newProductData.images.length > 1 && (
                      <>
                        <button
                          className="preview-nav-button preview-nav-prev"
                          onClick={() => setNewProductImageIndex((prev: number) => (prev > 0 ? prev - 1 : newProductData.images!.length - 1))}
                          aria-label="Предыдущее фото"
                        >
                          ‹
                        </button>

                        <button
                          className="preview-nav-button preview-nav-next"
                          onClick={() => setNewProductImageIndex((prev: number) => (prev < newProductData.images!.length - 1 ? prev + 1 : 0))}
                          aria-label="Следующее фото"
                        >
                          ›
                        </button>

                        <div className="preview-indicators">
                          {newProductData.images.map((_, index) => (
                            <button
                              key={index}
                              className={`preview-indicator ${index === newProductImageIndex ? 'preview-indicator-active' : ''}`}
                              onClick={() => setNewProductImageIndex(index)}
                              aria-label={`Фото ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="preview-details">
                    <h2 className="preview-title">{newProductData.title || '(название товара)'}</h2>
                    
                    <div className="preview-info">
                      <p className="preview-category">Категория: {newProductData.category}</p>
                      <p className="preview-price">Цена: {newProductData.price.toLocaleString('de-DE')} €</p>
                    </div>

                    {newProductData.description && (
                      <div className="preview-description-section">
                        <h3 className="preview-description-title">Описание</h3>
                        <p className="preview-description">{newProductData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => {
                setIsAddingProduct(false)
                setNewProductData(null)
                setNewProductImageIndex(0)
              }}>
                Отменить
              </button>
              <button className="btn-primary" onClick={() => {
                console.log('Новый товар добавлен:', newProductData)
                setIsAddingProduct(false)
                setNewProductData(null)
                setNewProductImageIndex(0)
              }}>
                ✅ Создать товар
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type RoomsTabProps = {
  editingRoom: (typeof rooms)[0] | null
  setEditingRoom: (room: (typeof rooms)[0] | null) => void
  setConfirmDelete: (item: ConfirmDelete) => void
  isAddingRoom: boolean
  setIsAddingRoom: (value: boolean) => void
  newRoomData: {
    title: string
    price: number
    capacity: number
    size: number
    description: string
    longDescription: string
    images: string[]
    amenities: string[]
  } | null
  setNewRoomData: (data: any) => void
  newRoomImageIndex: number
  setNewRoomImageIndex: (index: number | ((prev: number) => number)) => void
  newRoomImageUrl: string
  setNewRoomImageUrl: (url: string) => void
}

function RoomsTab({ 
  editingRoom, 
  setEditingRoom, 
  setConfirmDelete,
  isAddingRoom,
  setIsAddingRoom,
  newRoomData,
  setNewRoomData,
  newRoomImageIndex,
  setNewRoomImageIndex,
  newRoomImageUrl,
  setNewRoomImageUrl
}: RoomsTabProps) {
  const [formData, setFormData] = useState(editingRoom ? {
    title: editingRoom.title,
    price: editingRoom.price,
    capacity: editingRoom.capacity,
    size: editingRoom.size,
    description: editingRoom.description,
    longDescription: editingRoom.longDescription,
    images: editingRoom.images || [],
    amenities: editingRoom.amenities || [],
  } : null)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [newAmenity, setNewAmenity] = useState('')

  const handleSave = () => {
    console.log('Сохранено:', formData)
    setEditingRoom(null)
  }

  const addImage = () => {
    if (newImageUrl.trim() && formData) {
      const newImages = [...(formData.images || []), newImageUrl]
      setFormData({
        ...formData,
        images: newImages,
      })
      setNewImageUrl('')
    }
  }

  const deleteImage = (index: number) => {
    if (formData) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        images: newImages,
      })
    }
  }

  const moveImageUp = (index: number) => {
    if (formData && index > 0) {
      const newImages = [...formData.images]
      ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
      setFormData({
        ...formData,
        images: newImages,
      })
    }
  }

  const moveImageDown = (index: number) => {
    if (formData && index < formData.images.length - 1) {
      const newImages = [...formData.images]
      ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
      setFormData({
        ...formData,
        images: newImages,
      })
    }
  }

  const addNewRoom = () => {
    setNewRoomData({
      title: '',
      price: 0,
      capacity: 1,
      size: 0,
      description: '',
      longDescription: '',
      images: [],
      amenities: [],
    })
    setIsAddingRoom(true)
    setNewRoomImageIndex(0)
  }

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>🏨 Управление номерами</h2>
        <button className="btn-primary" onClick={() => addNewRoom()}>+ Добавить номер</button>
      </div>

      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Цена/ночь</th>
              <th>Описание</th>
              <th>Мест</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.title}</td>
                <td>€{room.price}</td>
                <td className="description-cell">{room.description}</td>
                <td>{room.capacity}</td>
                <td className="action-cell">
                  <button className="btn-small btn-edit" onClick={() => {
                    setEditingRoom(room)
                    setFormData({
                      title: room.title,
                      price: room.price,
                      capacity: room.capacity,
                      size: room.size,
                      description: room.description,
                      longDescription: room.longDescription,
                      images: room.images || [],
                      amenities: room.amenities || [],
                    })
                    setNewImageUrl('')
                    setNewAmenity('')
                  }}>
                    ✏️ Редакт.
                  </button>
                  <button className="btn-small btn-delete" onClick={() => setConfirmDelete({
                    type: 'room',
                    id: room.id,
                    name: room.title,
                  })}>🗑️ Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingRoom && formData && (
        <div className="modal-overlay" onClick={() => {
          setEditingRoom(null)
          setFormData(null)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Редактирование номера</h3>
              <button className="modal-close" onClick={() => {
                setEditingRoom(null)
                setFormData(null)
              }}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-body-form">
                <div className="form-group">
                  <label>Название номера</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Введите название"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Цена за ночь (€)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      placeholder="Введите цену"
                    />
                  </div>

                  <div className="form-group">
                    <label>Вместимость (человек)</label>
                    <input 
                      type="number" 
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      placeholder="Введите количество"
                    />
                  </div>
                  <div className="form-group">
                    <label>Площадь номера (м²)</label>
                    <input 
                      type="number" 
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: parseInt(e.target.value)})}
                      placeholder="Введите площадь"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Описание номера</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                    placeholder="Введите описание номера"
                    className="textarea-short"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Полное описание</label>
                  <textarea 
                    value={formData.longDescription}
                    onChange={(e) => setFormData({...formData, longDescription: e.target.value})}
                    rows={4}
                    placeholder="Введите полное описание номера"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Удобства номера</label>
                  <div className="amenities-manager">
                    {formData.amenities && formData.amenities.length > 0 && (
                      <div className="amenities-list">
                        {formData.amenities.map((amenity, index) => (
                          <div key={index} className="amenity-item">
                            <span>{amenity}</span>
                            <button 
                              type="button"
                              className="btn-amenity-delete"
                              onClick={() => setFormData({
                                ...formData,
                                amenities: formData.amenities.filter((_, i) => i !== index)
                              })}
                              title="Удалить"
                            >
                              ✗
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="add-amenity-form">
                      <input 
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Новое удобство"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newAmenity.trim()) {
                            setFormData({
                              ...formData,
                              amenities: [...formData.amenities, newAmenity]
                            })
                            setNewAmenity('')
                          }
                        }}
                      />
                      <button 
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          if (newAmenity.trim()) {
                            setFormData({
                              ...formData,
                              amenities: [...formData.amenities, newAmenity]
                            })
                            setNewAmenity('')
                          }
                        }}
                        title="Добавить удобство (или нажмите Enter)"
                        style={{whiteSpace: 'nowrap'}}
                      >
                        + Добавить
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Фотографии номера</label>
                  <div className="images-manager">
                    {formData.images && formData.images.length > 0 && (
                      <div className="images-list">
                        {formData.images.map((img, index) => (
                          <div key={index} className="image-item">
                            <img src={img} alt={`Room ${index + 1}`} />
                            <div className="image-controls">
                              {index > 0 && (
                                <button 
                                  type="button"
                                  className="btn-image-control"
                                  onClick={() => moveImageUp(index)}
                                  title="Переместить вверх"
                                >
                                  ⬆️
                                </button>
                              )}
                              {index < formData.images.length - 1 && (
                                <button 
                                  type="button"
                                  className="btn-image-control"
                                  onClick={() => moveImageDown(index)}
                                  title="Переместить вниз"
                                >
                                  ⬇️
                                </button>
                              )}
                              <button 
                                type="button"
                                className="btn-image-delete"
                                onClick={() => deleteImage(index)}
                                title="Удалить фото"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="add-image-form">
                      <input 
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Вставьте URL фотографии"
                        onKeyPress={(e) => e.key === 'Enter' && addImage()}
                      />
                      <button 
                        type="button"
                        className="btn-primary"
                        onClick={addImage}
                      >
                        + Добавить фото
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-body-preview">
                <div className="preview-card preview-card-room">
                  <div className="preview-gallery">
                    <img 
                      src={formData.images && formData.images.length > 0 ? formData.images[currentImageIndex] : editingRoom.images[0]} 
                      alt={formData.title} 
                      className="preview-image-large"
                    />
                    
                    {formData.images && formData.images.length > 1 && (
                      <>
                        <button
                          className="preview-nav-button preview-nav-prev"
                          onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : formData.images!.length - 1))}
                          aria-label="Предыдущее фото"
                        >
                          ‹
                        </button>

                        <button
                          className="preview-nav-button preview-nav-next"
                          onClick={() => setCurrentImageIndex((prev) => (prev < formData.images!.length - 1 ? prev + 1 : 0))}
                          aria-label="Следующее фото"
                        >
                          ›
                        </button>

                        <div className="preview-indicators">
                          {formData.images.map((_, index) => (
                            <button
                              key={index}
                              className={`preview-indicator ${index === currentImageIndex ? 'preview-indicator-active' : ''}`}
                              onClick={() => setCurrentImageIndex(index)}
                              aria-label={`Фото ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="preview-details">
                    <div className="room-preview-header">
                      <div>
                        <h2 className="preview-title">{formData.title || '(название номера)'}</h2>
                        <p className="room-preview-desc">{formData.description}</p>
                      </div>
                      <div className="room-preview-price">
                        <span className="room-preview-price-value">€{formData.price}</span>
                        <span className="room-preview-price-unit">/ ночь</span>
                      </div>
                    </div>

                    <div className="room-preview-section">
                      <h3>Описание</h3>
                      <p className="room-preview-long-desc">{formData.longDescription}</p>
                    </div>

                    <div className="room-preview-specs">
                      <div className="room-spec-item">
                        <span className="room-spec-icon">👥</span>
                        <div>
                          <span className="room-spec-label">Гостей</span>
                          <span className="room-spec-value">{formData.capacity}</span>
                        </div>
                      </div>
                      <div className="room-spec-item">
                        <span className="room-spec-icon">📏</span>
                        <div>
                          <span className="room-spec-label">Площадь</span>
                          <span className="room-spec-value">{formData.size} м²</span>
                        </div>
                      </div>
                    </div>

                    {formData.amenities && formData.amenities.length > 0 && (
                      <div className="room-preview-amenities">
                        <h3>Удобства</h3>
                        <div className="amenities-grid">
                          {formData.amenities.map((amenity, idx) => (
                            <div key={idx} className="amenity-badge">
                              <span className="amenity-check">✓</span>
                              {amenity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => {
                setEditingRoom(null)
                setFormData(null)
              }}>
                Отменить
              </button>
              <button className="btn-primary" onClick={handleSave}>
                💾 Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddingRoom && newRoomData && (
        <div className="modal-overlay" onClick={() => {
          setIsAddingRoom(false)
          setNewRoomData(null)
          setNewRoomImageIndex(0)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Добавление нового номера</h3>
              <button className="modal-close" onClick={() => {
                setIsAddingRoom(false)
                setNewRoomData(null)
                setNewRoomImageIndex(0)
              }}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-body-form">
                <div className="form-group">
                  <label>Название номера</label>
                  <input 
                    type="text" 
                    value={newRoomData.title}
                    onChange={(e) => setNewRoomData({...newRoomData, title: e.target.value})}
                    placeholder="Введите название"
                  />
                </div>

                <div className="form-group">
                  <label>Цена за ночь (€)</label>
                  <input 
                    type="number" 
                    value={newRoomData.price}
                    onChange={(e) => setNewRoomData({...newRoomData, price: parseFloat(e.target.value) || 0})}
                    placeholder="Введите цену"
                  />
                </div>

                <div style={{display: 'flex', gap: '15px'}}>
                  <div className="form-group" style={{flex: 1}}>
                    <label>Вместимость (чел.)</label>
                    <input 
                      type="number" 
                      value={newRoomData.capacity}
                      onChange={(e) => setNewRoomData({...newRoomData, capacity: parseInt(e.target.value) || 1})}
                      placeholder="Количество человек"
                    />
                  </div>

                  <div className="form-group" style={{flex: 1}}>
                    <label>Площадь (м²)</label>
                    <input 
                      type="number" 
                      value={newRoomData.size}
                      onChange={(e) => setNewRoomData({...newRoomData, size: parseFloat(e.target.value) || 0})}
                      placeholder="Площадь номера"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Описание</label>
                  <textarea 
                    value={newRoomData.description}
                    onChange={(e) => setNewRoomData({...newRoomData, description: e.target.value})}
                    placeholder="Введите краткое описание"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Полное описание</label>
                  <textarea 
                    value={newRoomData.longDescription}
                    onChange={(e) => setNewRoomData({...newRoomData, longDescription: e.target.value})}
                    placeholder="Введите полное описание"
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Удобства (добавьте список)</label>
                  <div style={{display: 'flex', gap: '8px', marginBottom: '10px'}}>
                    <input 
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Новое удобство"
                      onKeyPress={(e) => e.key === 'Enter' && newAmenity.trim() && (
                        setNewRoomData({
                          ...newRoomData,
                          amenities: [...newRoomData.amenities, newAmenity]
                        }),
                        setNewAmenity('')
                      )}
                    />
                    <button 
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        if (newAmenity.trim()) {
                          setNewRoomData({
                            ...newRoomData,
                            amenities: [...newRoomData.amenities, newAmenity]
                          })
                          setNewAmenity('')
                        }
                      }}
                      title="Добавить удобство (или нажмите Enter)"
                      style={{whiteSpace: 'nowrap'}}
                    >
                      + Добавить
                    </button>
                  </div>
                  {newRoomData.amenities.length > 0 && (
                    <div className="amenities-list">
                      {newRoomData.amenities.map((amenity, idx) => (
                        <div key={idx} className="amenity-item">
                          <span>{amenity}</span>
                          <button 
                            type="button"
                            className="btn-amenity-delete"
                            onClick={() => setNewRoomData({
                              ...newRoomData,
                              amenities: newRoomData.amenities.filter((_, i) => i !== idx)
                            })}
                          >
                            ✗
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Изображение (URL)</label>
                  <input 
                    type="text" 
                    value={newRoomImageUrl}
                    onChange={(e) => setNewRoomImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <button 
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      if (newRoomImageUrl.trim() && !newRoomData.images.includes(newRoomImageUrl)) {
                        const newImages = [...newRoomData.images, newRoomImageUrl]
                        setNewRoomData({...newRoomData, images: newImages})
                        setNewRoomImageIndex(newImages.length - 1)
                        setNewRoomImageUrl('')
                      }
                    }}
                  >
                    + Добавить фото
                  </button>
                </div>

                {newRoomData.images.length > 0 && (
                  <div className="images-list">
                    <h4>Добавленные фото:</h4>
                    {newRoomData.images.map((img, idx) => (
                      <div key={idx} className="image-item">
                        <img src={img} alt={`Room ${idx}`} style={{maxHeight: '80px'}} />
                        <button
                          className="btn-image-delete"
                          onClick={() => {
                            const newImages = newRoomData.images.filter((_, i) => i !== idx)
                            setNewRoomData({...newRoomData, images: newImages})
                            if (newRoomImageIndex >= newImages.length && newImages.length > 0) {
                              setNewRoomImageIndex(newImages.length - 1)
                            }
                          }}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-body-preview">
                <div className="preview-card preview-card-room">
                  <div className="preview-gallery">
                    <img 
                      src={newRoomData.images && newRoomData.images.length > 0 ? newRoomData.images[newRoomImageIndex] : '/placeholder.png'} 
                      alt={newRoomData.title || 'номер'} 
                      className="preview-image-large"
                    />
                    
                    {newRoomData.images && newRoomData.images.length > 1 && (
                      <>
                        <button
                          className="preview-nav-button preview-nav-prev"
                          onClick={() => setNewRoomImageIndex((prev: number) => (prev > 0 ? prev - 1 : newRoomData.images!.length - 1))}
                          aria-label="Предыдущее фото"
                        >
                          ‹
                        </button>

                        <button
                          className="preview-nav-button preview-nav-next"
                          onClick={() => setNewRoomImageIndex((prev: number) => (prev < newRoomData.images!.length - 1 ? prev + 1 : 0))}
                          aria-label="Следующее фото"
                        >
                          ›
                        </button>

                        <div className="preview-indicators">
                          {newRoomData.images.map((_, index) => (
                            <button
                              key={index}
                              className={`preview-indicator ${index === newRoomImageIndex ? 'preview-indicator-active' : ''}`}
                              onClick={() => setNewRoomImageIndex(index)}
                              aria-label={`Фото ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="preview-details">
                    <div className="room-preview-header">
                      <div>
                        <h2 className="preview-title">{newRoomData.title || '(название номера)'}</h2>
                        <p className="room-preview-desc">{newRoomData.description}</p>
                      </div>
                      <div className="room-preview-price">
                        <span className="room-preview-price-value">€{newRoomData.price}</span>
                        <span className="room-preview-price-unit">/ ночь</span>
                      </div>
                    </div>

                    {newRoomData.longDescription && (
                      <div className="room-preview-section">
                        <h3>Описание</h3>
                        <p className="room-preview-long-desc">{newRoomData.longDescription}</p>
                      </div>
                    )}

                    <div className="room-preview-specs">
                      <div className="room-spec-item">
                        <span className="room-spec-icon">👥</span>
                        <div>
                          <span className="room-spec-label">Гостей</span>
                          <span className="room-spec-value">{newRoomData.capacity}</span>
                        </div>
                      </div>
                      <div className="room-spec-item">
                        <span className="room-spec-icon">📏</span>
                        <div>
                          <span className="room-spec-label">Площадь</span>
                          <span className="room-spec-value">{newRoomData.size} м²</span>
                        </div>
                      </div>
                    </div>

                    {newRoomData.amenities && newRoomData.amenities.length > 0 && (
                      <div className="room-preview-amenities">
                        <h3>Удобства</h3>
                        <div className="amenities-grid">
                          {newRoomData.amenities.map((amenity, idx) => (
                            <div key={idx} className="amenity-badge">
                              <span className="amenity-check">✓</span>
                              {amenity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => {
                setIsAddingRoom(false)
                setNewRoomData(null)
                setNewRoomImageIndex(0)
                setNewRoomImageUrl('')
              }}>
                Отменить
              </button>
              <button className="btn-primary" onClick={() => {
                console.log('Новый номер добавлен:', newRoomData)
                setIsAddingRoom(false)
                setNewRoomData(null)
                setNewRoomImageIndex(0)
                setNewRoomImageUrl('')
              }}>
                ✅ Создать номер
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type MenusTabProps = {
  editingMenu: (typeof DAYS)[0] | null
  setEditingMenu: (menu: (typeof DAYS)[0] | null) => void
  setConfirmDelete: (item: ConfirmDelete) => void
}

function MenusTab({ editingMenu, setEditingMenu, setConfirmDelete }: MenusTabProps) {
  const [formData, setFormData] = useState<(typeof DAYS)[0] | null>(null)
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0)
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [showAddMenuDropdown, setShowAddMenuDropdown] = useState(false)
  const [menuDays, setMenuDays] = useState(DAYS)
  const [isAddingNewMenu, setIsAddingNewMenu] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-menu-dropdown]')) {
        setShowAddMenuDropdown(false)
      }
    }

    if (showAddMenuDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showAddMenuDropdown])

  const openEditMenu = (day: (typeof DAYS)[0], isNew: boolean = false) => {
    setIsAddingNewMenu(isNew)
    setEditingMenu(day)
    setFormData(JSON.parse(JSON.stringify(day)))
    setSelectedSectionIndex(0)
  }

  const closeModal = () => {
    setEditingMenu(null)
    setFormData(null)
    setIsAddingNewMenu(false)
    setNewItemName('')
    setNewItemPrice('')
    setNewItemDescription('')
  }

  const addNewMenu = (dayLabel: string) => {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const dayIndex = days.indexOf(dayLabel)
    
    if (dayIndex !== -1) {
      const newMenu: (typeof DAYS)[0] = {
        day: dayKeys[dayIndex],
        label: dayLabel,
        sections: [
          {
            category: 'Завтрак',
            items: [],
          },
          {
            category: 'Обед',
            items: [],
          },
          {
            category: 'Ужин',
            items: [],
          },
          {
            category: 'Десерты',
            items: [],
          },
        ],
      }
      
      const existingMenu = menuDays.find(m => m.day === dayKeys[dayIndex])
      if (!existingMenu) {
        setMenuDays([...menuDays, newMenu])
      }
      
      setShowAddMenuDropdown(false)
      openEditMenu(newMenu, true)
    }
  }

  const addMenuItem = () => {
    if (!formData || !newItemName.trim() || !newItemPrice.trim()) return

    const section = formData.sections[selectedSectionIndex]
    const newId = Math.max(...section.items.map(i => i.id), 0) + 1

    setFormData({
      ...formData,
      sections: formData.sections.map((sec, idx) =>
        idx === selectedSectionIndex
          ? {
              ...sec,
              items: [...sec.items, {
                id: newId,
                name: newItemName,
                description: newItemDescription || undefined,
                price: newItemPrice,
              }],
            }
          : sec
      ),
    })

    setNewItemName('')
    setNewItemPrice('')
    setNewItemDescription('')
  }

  const deleteMenuItem = (itemId: number) => {
    if (!formData) return

    setFormData({
      ...formData,
      sections: formData.sections.map((sec, idx) =>
        idx === selectedSectionIndex
          ? {
              ...sec,
              items: sec.items.filter(item => item.id !== itemId),
            }
          : sec
      ),
    })
  }

  const updateMenuItem = (itemId: number, updates: { name?: string; description?: string; price?: string }) => {
    if (!formData) return

    setFormData({
      ...formData,
      sections: formData.sections.map((sec, idx) =>
        idx === selectedSectionIndex
          ? {
              ...sec,
              items: sec.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : sec
      ),
    })
  }

  const currentSection = formData?.sections[selectedSectionIndex]

  const handlePriceInput = (value: string): string => {
    let filtered = value.replace(/[^\d.]/g, '')
    const parts = filtered.split('.')
    if (parts.length > 2) {
      filtered = parts[0] + '.' + parts.slice(1).join('')
    }
    if (filtered.startsWith('.')) {
      filtered = filtered.substring(1)
    }
    return filtered
  }

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>🍽️ Управление меню</h2>
        <div style={{ position: 'relative', display: 'inline-block' }} data-menu-dropdown>
          <button 
            className="btn-primary"
            onClick={() => setShowAddMenuDropdown(!showAddMenuDropdown)}
          >
            + Добавить дневное меню
          </button>
          {showAddMenuDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: '#0B1220',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
              zIndex: 1000,
              minWidth: '200px',
              marginTop: '8px',
            }}>
              {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((day) => (
                <button
                  key={day}
                  onClick={() => addNewMenu(day)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    border: 'none',
                    backgroundColor: '#0B1220',
                    color: '#c8c8d8',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.15)'
                    e.currentTarget.style.color = '#667eea'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0B1220'
                    e.currentTarget.style.color = '#c8c8d8'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="menus-list">
        {menuDays.map((day) => (
          <div key={day.day} className="menu-day-card">
            <div className="menu-day-header">
              <h3>{day.label}</h3>
              <div className="menu-actions">
                <button
                  className="btn-small btn-edit"
                  onClick={() => openEditMenu(day)}
                >
                  ✏️ Редакт.
                </button>
                <button className="btn-small btn-delete" onClick={() => setConfirmDelete({
                  type: 'menu',
                  id: day.sections.length,
                  name: day.label,
                })}>🗑️ Удалить</button>
              </div>
            </div>
            <div className="menu-sections">
              {day.sections.map((section) => (
                <div key={section.category} className="menu-section">
                  <h4>{section.category}</h4>
                  <ul>
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <span className="item-name">{item.name}</span>
                        {item.description && <span className="item-desc">{item.description}</span>}
                        <span className="item-price">{item.price}€</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingMenu && formData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content menu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isAddingNewMenu ? '➕ Добавление меню' : '✏️ Редактирование меню'} - {formData.label}</h2>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-body-form">
                <div className="menu-editor">
                  <div className="sections-tabs">
                    {formData.sections.map((section, idx) => (
                      <button
                        key={section.category}
                        className={`section-tab ${selectedSectionIndex === idx ? 'active' : ''}`}
                        onClick={() => setSelectedSectionIndex(idx)}
                      >
                        {section.category}
                      </button>
                    ))}
                  </div>

                  {currentSection && (
                    <div className="menu-items-editor">
                      <h3>{currentSection.category}</h3>
                      <div className="items-editor-scroll">
                        <div className="items-list">
                          {currentSection.items.map((item) => (
                          <div key={item.id} className="menu-item-edit">
                            <div className="item-inputs">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateMenuItem(item.id, { name: e.target.value })}
                                placeholder="Название блюда"
                                className="input-item-name"
                              />
                              <textarea
                                value={item.description || ''}
                                onChange={(e) => updateMenuItem(item.id, { description: e.target.value })}
                                placeholder="Описание (необязательно)"
                                className="input-item-desc"
                                rows={2}
                              />
                            </div>
                            <div className="item-footer">
                              <input
                                type="text"
                                value={item.price}
                                onChange={(e) => updateMenuItem(item.id, { price: handlePriceInput(e.target.value) })}
                                placeholder="Цена"
                                className="input-item-price"
                                inputMode="decimal"
                              />
                              <button
                                className="btn-item-delete"
                                onClick={() => deleteMenuItem(item.id)}
                                title="Удалить блюдо"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          ))}
                        </div>

                        <div className="add-item-form">
                        <h4>Добавить новое блюдо</h4>
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Название блюда"
                          className="form-input"
                        />
                        <textarea
                          value={newItemDescription}
                          onChange={(e) => setNewItemDescription(e.target.value)}
                          placeholder="Описание (необязательно)"
                          rows={2}
                          className="form-input"
                        />
                        <input
                          type="text"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(handlePriceInput(e.target.value))}
                          placeholder="Цена"
                          className="form-input"
                          inputMode="decimal"
                        />
                        <button
                          className="btn-secondary"
                          onClick={addMenuItem}
                        >
                          + Добавить блюдо
                        </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-body-preview">
                <div className="preview-menu">
                  <h3>{formData.label}</h3>
                  {formData.sections.map((section) => (
                    <div key={section.category} className="preview-menu-section">
                      <h4>{section.category}</h4>
                      <ul className="preview-items">
                        {section.items.map((item) => (
                          <li key={item.id} className="preview-menu-item">
                            <div className="item-header">
                              <span className="item-name">{item.name}</span>
                              <span className="item-price">{isNaN(parseFloat(item.price)) ? '' : parseFloat(item.price).toFixed(2)}€</span>
                            </div>
                            {item.description && (
                              <span className="item-desc">{item.description}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>
                Отмена
              </button>
              <button className="btn-primary" onClick={() => {
                console.log('Меню сохранено:', formData)
                closeModal()
              }}>
                💾 Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type AttractionsTabProps = {
  editingAttraction: Attraction | null
  setEditingAttraction: (attraction: Attraction | null) => void
  setConfirmDelete: (item: ConfirmDelete) => void
  isAddingAttraction: boolean
  setIsAddingAttraction: (value: boolean) => void
  newAttractionData: Attraction | null
  setNewAttractionData: (data: Attraction | null) => void
  newAttractionImageIndex: number
  setNewAttractionImageIndex: React.Dispatch<React.SetStateAction<number>>
}

function AttractionsTab({ editingAttraction, setEditingAttraction, setConfirmDelete, isAddingAttraction, setIsAddingAttraction, newAttractionData, setNewAttractionData, newAttractionImageIndex, setNewAttractionImageIndex }: AttractionsTabProps) {
  const DEFAULT_ATTRACTION_CATEGORIES = ['culture', 'nature', 'food', 'shopping', 'family', 'nightlife']
  const [formData, setFormData] = useState<Attraction | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [attractionCategories, setAttractionCategories] = useState(DEFAULT_ATTRACTION_CATEGORIES)
  const [newAttractionCategory, setNewAttractionCategory] = useState('')
  const [attractionCategoryDropdownOpen, setAttractionCategoryDropdownOpen] = useState(false)

  const handleSave = () => {
    console.log('Сохранено:', formData)
    setEditingAttraction(null)
    setFormData(null)
  }

  const addAttractionCategory = () => {
    if (newAttractionCategory.trim() && !attractionCategories.includes(newAttractionCategory)) {
      setAttractionCategories([...attractionCategories, newAttractionCategory])
      if (formData) {
        setFormData({...formData, category: newAttractionCategory as any})
      }
      setNewAttractionCategory('')
    }
  }

  const addImage = () => {
    if (newImageUrl.trim() && formData) {
      const newImages = [...(formData.images || []), newImageUrl]
      setFormData({
        ...formData,
        images: newImages,
      })
      setNewImageUrl('')
    }
  }

  const deleteImage = (index: number) => {
    if (formData) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        images: newImages,
      })
    }
  }

  const moveImageUp = (index: number) => {
    if (formData && index > 0) {
      const newImages = [...formData.images]
      ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
      setFormData({
        ...formData,
        images: newImages,
      })
    }
  }

  const moveImageDown = (index: number) => {
    if (formData && index < formData.images.length - 1) {
      const newImages = [...formData.images]
      ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
      setFormData({
        ...formData,
        images: newImages,
      })
    }
  }

  const openEditAttraction = (attraction: Attraction) => {
    setEditingAttraction(attraction)
    setFormData(JSON.parse(JSON.stringify(attraction)))
    setCurrentImageIndex(0)
  }

  const closeModal = () => {
    setEditingAttraction(null)
    setFormData(null)
    setCurrentImageIndex(0)
    setNewImageUrl('')
    setAttractionCategoryDropdownOpen(false)
    setNewAttractionCategory('')
    setAttractionCategories(DEFAULT_ATTRACTION_CATEGORIES)
  }

  return (
    <div className="admin-tab">
      <div className="tab-header">
        <h2>🗺️ Управление достопримечательностями</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            const newAttraction: Attraction = {
              id: `attr-${Date.now()}`,
              name: '',
              shortDescription: '',
              description: '',
              category: 'culture',
              address: '',
              coords: { lat: 43.55, lng: 7.01 },
              distanceKm: 0,
              price: 0,
              openingHours: {
                monday: '09:00-18:00',
                tuesday: '09:00-18:00',
                wednesday: '09:00-18:00',
                thursday: '09:00-18:00',
                friday: '09:00-18:00',
                saturday: '10:00-19:00',
                sunday: '10:00-19:00',
              },
              rating: 5,
              images: [],
              partnerContact: {
                phone: '',
                email: '',
                website: '',
                bookingUrl: '',
              },
            }
            setNewAttractionData(newAttraction)
            setIsAddingAttraction(true)
          }}
        >
          + Добавить достопримечательность
        </button>
      </div>

      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Описание</th>
              <th>Рейтинг</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {attractions.map((attraction: Attraction) => (
              <tr key={attraction.id}>
                <td>{attraction.id}</td>
                <td>{attraction.name}</td>
                <td>{attraction.category}</td>
                <td>{attraction.price} € </td>
                <td className="description-cell">{attraction.shortDescription.substring(0, 50)}...</td>
                <td>⭐ {attraction.rating}</td>
                <td className="action-cell">
                  <button className="btn-small btn-edit" onClick={() => openEditAttraction(attraction)}>
                    ✏️ Редакт.
                  </button>
                  <button className="btn-small btn-delete" onClick={() => setConfirmDelete({
                    type: 'attraction',
                    id: attraction.id,
                    name: attraction.name,
                  })}>🗑️ Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingAttraction && formData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Редактирование достопримечательности</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-body-form">
                <div className="form-group">
                  <label>Название</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Введите название"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{flex: 1}}>
                    <label>Категория</label>
                    <div className="custom-dropdown">
                      <button 
                        type="button"
                        className="custom-dropdown-btn"
                        onClick={() => setAttractionCategoryDropdownOpen(!attractionCategoryDropdownOpen)}
                      >
                        {formData.category}
                        <span className="dropdown-arrow">▼</span>
                      </button>
                      {attractionCategoryDropdownOpen && (
                        <div className="custom-dropdown-menu">
                          {attractionCategories.map((cat) => (
                            <button 
                              key={cat}
                              type="button"
                              className={`dropdown-item ${formData.category === cat ? 'active' : ''}`}
                              onClick={() => {
                                setFormData({...formData, category: cat as any})
                                setAttractionCategoryDropdownOpen(false)
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                          <div className="dropdown-divider"></div>
                          <div className="dropdown-add-category">
                            <input 
                              type="text"
                              value={newAttractionCategory}
                              onChange={(e) => setNewAttractionCategory(e.target.value)}
                              placeholder="Новая категория"
                              onClick={(e) => e.stopPropagation()}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addAttractionCategory()
                                  setAttractionCategoryDropdownOpen(false)
                                }
                              }}
                            />
                            <button 
                              type="button"
                              className="dropdown-add-btn"
                              onClick={() => {
                                addAttractionCategory()
                                setAttractionCategoryDropdownOpen(false)
                              }}
                            >
                              + Добавить
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group" style={{flex: 1}}>
                    <label>Цена (€)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      placeholder="Введите цену"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Краткое описание</label>
                  <textarea 
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                    placeholder="Введите краткое описание"
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Полное описание</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Введите полное описание"
                    rows={4}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{flex: 1}}>
                    <label>Расстояние (км)</label>
                    <input 
                      type="number" 
                      value={formData.distanceKm}
                      onChange={(e) => setFormData({...formData, distanceKm: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Контактный телефон</label>
                  <input 
                    type="text" 
                    value={formData.partnerContact.phone}
                    onChange={(e) => {
                      let value = e.target.value
                      const hasPlus = value.startsWith('+')
                      let cleaned = value.replace(/[^\d+]/g, '').replace(/\+/g, '')
                      if (cleaned.length > 15) {
                        cleaned = cleaned.slice(0, 15)
                      }
                      const formatted = hasPlus ? '+' + cleaned : cleaned
                      
                      setFormData({
                        ...formData,
                        partnerContact: {...formData.partnerContact, phone: formatted}
                      })
                    }}
                    placeholder="+33 4 93 00 00 01"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="text" 
                    value={formData.partnerContact.email}
                    onChange={(e) => {
                      let value = e.target.value
                      value = value.replace(/[^a-zA-Z0-9@.\-_+]/g, '')
                      
                      setFormData({
                        ...formData,
                        partnerContact: {...formData.partnerContact, email: value}
                      })
                    }}
                    placeholder="example@domain.com"
                  />
                </div>

                <div className="form-group">
                  <label>Веб-сайт</label>
                  <input 
                    type="text" 
                    value={formData.partnerContact.website || ''}
                    onChange={(e) => {
                      let value = e.target.value
                      
                      // Проверяем что вводят только валидные URL символы
                      // Разрешаем: энгл буквы, цифры, .-_~/:?#[]@!$&'()*+,;=%
                      // Отклоняем: кириллицу, спецсимволы и спацес
                      const validUrlRegex = /^[a-zA-Z0-9.\-_~:/?#\[\]@!$&'()*+,;=%]*$/
                      if (!validUrlRegex.test(value)) {
                        return
                      }
                      
                      setFormData({
                        ...formData,
                        partnerContact: {...formData.partnerContact, website: value}
                      })
                    }}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Фотографии</label>
                  <div className="images-manager">
                    {formData.images && formData.images.length > 0 && (
                      <div className="images-list">
                        {formData.images.map((img, index) => (
                          <div key={index} className="image-item">
                            <img src={img} alt={`Attraction ${index + 1}`} />
                            <div className="image-controls">
                              {index > 0 && (
                                <button 
                                  type="button"
                                  className="btn-image-control"
                                  onClick={() => moveImageUp(index)}
                                  title="Переместить вверх"
                                >
                                  ⬆️
                                </button>
                              )}
                              {index < formData.images.length - 1 && (
                                <button 
                                  type="button"
                                  className="btn-image-control"
                                  onClick={() => moveImageDown(index)}
                                  title="Переместить вниз"
                                >
                                  ⬇️
                                </button>
                              )}
                              <button 
                                type="button"
                                className="btn-image-delete"
                                onClick={() => deleteImage(index)}
                                title="Удалить фото"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="add-image-form">
                      <input 
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Вставьте URL фотографии"
                        onKeyPress={(e) => e.key === 'Enter' && addImage()}
                      />
                      <button 
                        type="button"
                        className="btn-primary"
                        onClick={addImage}
                      >
                        + Добавить фото
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-body-preview">
                <div className="preview-card">
                  <div className="preview-gallery">
                    <img 
                      src={formData.images && formData.images.length > 0 ? formData.images[currentImageIndex] : '/placeholder.png'} 
                      alt={formData.name} 
                      className="preview-image-large"
                    />
                    
                    {formData.images && formData.images.length > 1 && (
                      <>
                        <button
                          className="preview-nav-button preview-nav-prev"
                          onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : formData.images!.length - 1))}
                          aria-label="Предыдущее фото"
                        >
                          ‹
                        </button>

                        <button
                          className="preview-nav-button preview-nav-next"
                          onClick={() => setCurrentImageIndex((prev) => (prev < formData.images!.length - 1 ? prev + 1 : 0))}
                          aria-label="Следующее фото"
                        >
                          ›
                        </button>

                        <div className="preview-indicators">
                          {formData.images.map((_, index) => (
                            <button
                              key={index}
                              className={`preview-indicator ${index === currentImageIndex ? 'preview-indicator-active' : ''}`}
                              onClick={() => setCurrentImageIndex(index)}
                              aria-label={`Фото ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="preview-details">
                    <h2 className="preview-title">{formData.name || '(название)'}</h2>
                    
                    <div className="preview-info">
                      <p className="preview-category">Категория: {formData.category}</p>
                      <p className="preview-price">Цена: {formData.price} €</p>
                    </div>

                    {formData.shortDescription && (
                      <div className="preview-description-section">
                        <h3 className="preview-description-title">Описание</h3>
                        <p className="preview-description">{formData.shortDescription}</p>
                      </div>
                    )}

                    {(formData.partnerContact.phone || formData.partnerContact.email || formData.partnerContact.website) && (
                      <div className="preview-description-section">
                        <h3 className="preview-description-title">Контакты партнера</h3>
                        <div style={{display: 'flex', flexDirection: 'row', columnGap: '1rem', rowGap: '0.25rem', flexWrap: 'wrap', alignItems: 'center', color: '#c8c8d8', fontSize: '14px'}}>
                          {formData.partnerContact.phone && (
                            <p style={{margin: 0, display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
                              <span style={{fontSize: '1.1rem', width: '1.2rem'}}>📱</span>
                              {formData.partnerContact.phone}
                            </p>
                          )}
                          {formData.partnerContact.email && (
                            <p style={{margin: 0, display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
                              <span style={{fontSize: '1.1rem', width: '1.2rem'}}>📧</span>
                              {formData.partnerContact.email}
                            </p>
                          )}
                          {formData.partnerContact.website && (
                            <p style={{margin: 0, display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
                              <span style={{fontSize: '1.1rem', width: '1.2rem'}}>🌐</span>
                              <a
                                href={`https://${formData.partnerContact.website.replace(/^https?:\/\//, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{color: '#667eea', textDecoration: 'none'}}
                              >
                                {formData.partnerContact.website}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>
                Отменить
              </button>
              <button className="btn-primary" onClick={handleSave}>
                💾 Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddingAttraction && newAttractionData && (
        <div className="modal-overlay" onClick={() => {
          setIsAddingAttraction(false)
          setNewAttractionData(null)
          setNewAttractionImageIndex(0)
          setAttractionCategoryDropdownOpen(false)
          setNewAttractionCategory('')
          setAttractionCategories(DEFAULT_ATTRACTION_CATEGORIES)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Добавление новой достопримечательности</h3>
              <button className="modal-close" onClick={() => {
                setIsAddingAttraction(false)
                setNewAttractionData(null)
                setNewAttractionImageIndex(0)
                setAttractionCategoryDropdownOpen(false)
                setNewAttractionCategory('')
                setAttractionCategories(DEFAULT_ATTRACTION_CATEGORIES)
              }}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-body-form">
                <div className="form-group">
                  <label>Название</label>
                  <input 
                    type="text" 
                    value={newAttractionData.name}
                    onChange={(e) => setNewAttractionData({...newAttractionData, name: e.target.value})}
                    placeholder="Введите название"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{flex: 1}}>
                    <label>Категория</label>
                    <div className="custom-dropdown">
                      <button 
                        type="button"
                        className="custom-dropdown-btn"
                        onClick={() => setAttractionCategoryDropdownOpen(!attractionCategoryDropdownOpen)}
                      >
                        {newAttractionData.category}
                        <span className="dropdown-arrow">▼</span>
                      </button>
                      {attractionCategoryDropdownOpen && (
                        <div className="custom-dropdown-menu">
                          {attractionCategories.map((cat) => (
                            <button 
                              key={cat}
                              type="button"
                              className={`dropdown-item ${newAttractionData.category === cat ? 'active' : ''}`}
                              onClick={() => {
                                setNewAttractionData({...newAttractionData, category: cat as any})
                                setAttractionCategoryDropdownOpen(false)
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                          <div className="dropdown-divider"></div>
                          <div className="dropdown-add-category">
                            <input 
                              type="text"
                              value={newAttractionCategory}
                              onChange={(e) => setNewAttractionCategory(e.target.value)}
                              placeholder="Новая категория"
                              onClick={(e) => e.stopPropagation()}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  if (newAttractionCategory.trim() && !attractionCategories.includes(newAttractionCategory)) {
                                    setAttractionCategories([...attractionCategories, newAttractionCategory])
                                    setNewAttractionData({...newAttractionData, category: newAttractionCategory as any})
                                    setNewAttractionCategory('')
                                  }
                                  setAttractionCategoryDropdownOpen(false)
                                }
                              }}
                            />
                            <button 
                              type="button"
                              className="dropdown-add-btn"
                              onClick={() => {
                                if (newAttractionCategory.trim() && !attractionCategories.includes(newAttractionCategory)) {
                                  setAttractionCategories([...attractionCategories, newAttractionCategory])
                                  setNewAttractionData({...newAttractionData, category: newAttractionCategory as any})
                                  setNewAttractionCategory('')
                                }
                                setAttractionCategoryDropdownOpen(false)
                              }}
                            >
                              + Добавить
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group" style={{flex: 1}}>
                    <label>Цена (€)</label>
                    <input 
                      type="number" 
                      value={newAttractionData.price}
                      onChange={(e) => setNewAttractionData({...newAttractionData, price: parseFloat(e.target.value)})}
                      placeholder="Введите цену"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Краткое описание</label>
                  <textarea 
                    value={newAttractionData.shortDescription}
                    onChange={(e) => setNewAttractionData({...newAttractionData, shortDescription: e.target.value})}
                    placeholder="Введите краткое описание"
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Полное описание</label>
                  <textarea 
                    value={newAttractionData.description}
                    onChange={(e) => setNewAttractionData({...newAttractionData, description: e.target.value})}
                    placeholder="Введите полное описание"
                    rows={4}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{flex: 1}}>
                    <label>Расстояние (км)</label>
                    <input 
                      type="number" 
                      value={newAttractionData.distanceKm}
                      onChange={(e) => setNewAttractionData({...newAttractionData, distanceKm: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Контактный телефон</label>
                  <input 
                    type="text" 
                    value={newAttractionData.partnerContact.phone}
                    onChange={(e) => {
                      let value = e.target.value
                      const hasPlus = value.startsWith('+')
                      let cleaned = value.replace(/[^\d+]/g, '').replace(/\+/g, '')
                      
                      if (cleaned.length > 15) {
                        cleaned = cleaned.slice(0, 15)
                      }
                      
                      const formatted = hasPlus ? '+' + cleaned : cleaned
                      
                      setNewAttractionData({
                        ...newAttractionData,
                        partnerContact: {...newAttractionData.partnerContact, phone: formatted}
                      })
                    }}
                    placeholder="+33 4 93 00 00 01"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="text" 
                    value={newAttractionData.partnerContact.email}
                    onChange={(e) => {
                      let value = e.target.value
                      // Проверяем и очищаем невалидные символы в режиме реального времени
                      // Однако разрешаем всё что может включать email
                      // Очищаем кто любые спецсимволы кроме @.-_+
                      value = value.replace(/[^a-zA-Z0-9@.\-_+]/g, '')
                      
                      setNewAttractionData({
                        ...newAttractionData,
                        partnerContact: {...newAttractionData.partnerContact, email: value}
                      })
                    }}
                    placeholder="example@domain.com"
                  />
                </div>

                <div className="form-group">
                  <label>Веб-сайт</label>
                  <input 
                    type="text" 
                    value={newAttractionData.partnerContact.website || ''}
                    onChange={(e) => {
                      let value = e.target.value
                      
                      // Проверяем что вводят только валидные URL символы
                      // Разрешаем: энгл буквы, цифры, .-_~/:?#[]@!$&'()*+,;=%
                      // Отклоняем: кириллицу, спецсимволы и спацес
                      const validUrlRegex = /^[a-zA-Z0-9.\-_~:/?#\[\]@!$&'()*+,;=%]*$/
                      if (!validUrlRegex.test(value)) {
                        return
                      }
                      
                      setNewAttractionData({
                        ...newAttractionData,
                        partnerContact: {...newAttractionData.partnerContact, website: value}
                      })
                    }}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Фотографии</label>
                  <div className="images-manager">
                    {newAttractionData.images && newAttractionData.images.length > 0 && (
                      <div className="images-list">
                        {newAttractionData.images.map((img, index) => (
                          <div key={index} className="image-item">
                            <img src={img} alt={`Attraction ${index + 1}`} />
                            <div className="image-controls">
                              {index > 0 && (
                                <button 
                                  type="button"
                                  className="btn-image-control"
                                  onClick={() => {
                                    const newImages = [...newAttractionData.images]
                                    ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
                                    setNewAttractionData({
                                      ...newAttractionData,
                                      images: newImages,
                                    })
                                  }}
                                  title="Переместить вверх"
                                >
                                  ⬆️
                                </button>
                              )}
                              {index < newAttractionData.images.length - 1 && (
                                <button 
                                  type="button"
                                  className="btn-image-control"
                                  onClick={() => {
                                    const newImages = [...newAttractionData.images]
                                    ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
                                    setNewAttractionData({
                                      ...newAttractionData,
                                      images: newImages,
                                    })
                                  }}
                                  title="Переместить вниз"
                                >
                                  ⬇️
                                </button>
                              )}
                              <button 
                                type="button"
                                className="btn-image-delete"
                                onClick={() => {
                                  const newImages = newAttractionData.images.filter((_, i) => i !== index)
                                  setNewAttractionData({
                                    ...newAttractionData,
                                    images: newImages,
                                  })
                                }}
                                title="Удалить фото"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="add-image-form">
                      <input 
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Вставьте URL фотографии"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newImageUrl.trim() && newAttractionData) {
                            const newImages = [...(newAttractionData.images || []), newImageUrl]
                            setNewAttractionData({
                              ...newAttractionData,
                              images: newImages,
                            })
                            setNewImageUrl('')
                          }
                        }}
                      />
                      <button 
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          if (newImageUrl.trim() && newAttractionData) {
                            const newImages = [...(newAttractionData.images || []), newImageUrl]
                            setNewAttractionData({
                              ...newAttractionData,
                              images: newImages,
                            })
                            setNewImageUrl('')
                          }
                        }}
                      >
                        + Добавить фото
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-body-preview">
                <div className="preview-card">
                  <div className="preview-gallery">
                    <img 
                      src={newAttractionData.images && newAttractionData.images.length > 0 ? newAttractionData.images[newAttractionImageIndex] : '/placeholder.png'} 
                      alt={newAttractionData.name} 
                      className="preview-image-large"
                    />
                    
                    {newAttractionData.images && newAttractionData.images.length > 1 && (
                      <>
                        <button
                          className="preview-nav-button preview-nav-prev"
                          onClick={() => setNewAttractionImageIndex((prev) => (prev > 0 ? prev - 1 : newAttractionData.images!.length - 1))}
                          aria-label="Предыдущее фото"
                        >
                          ‹
                        </button>

                        <button
                          className="preview-nav-button preview-nav-next"
                          onClick={() => setNewAttractionImageIndex((prev) => (prev < newAttractionData.images!.length - 1 ? prev + 1 : 0))}
                          aria-label="Следующее фото"
                        >
                          ›
                        </button>

                        <div className="preview-indicators">
                          {newAttractionData.images.map((_, index) => (
                            <button
                              key={index}
                              className={`preview-indicator ${index === newAttractionImageIndex ? 'preview-indicator-active' : ''}`}
                              onClick={() => setNewAttractionImageIndex(index)}
                              aria-label={`Фото ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="preview-details">
                    <h2 className="preview-title">{newAttractionData.name || '(название)'}</h2>
                    
                    <div className="preview-info">
                      <p className="preview-category">Категория: {newAttractionData.category}</p>
                      <p className="preview-price">Цена: {newAttractionData.price} €</p>
                    </div>

                    {newAttractionData.shortDescription && (
                      <div className="preview-description-section">
                        <h3 className="preview-description-title">Описание</h3>
                        <p className="preview-description">{newAttractionData.shortDescription}</p>
                      </div>
                    )}

                    {(newAttractionData.partnerContact.phone || newAttractionData.partnerContact.email || newAttractionData.partnerContact.website) && (
                      <div className="preview-description-section">
                        <h3 className="preview-description-title">Контакты партнера</h3>
                        <div style={{display: 'flex', flexDirection: 'row', columnGap: '1rem', rowGap: '0.25rem', flexWrap: 'wrap', alignItems: 'center', color: '#c8c8d8', fontSize: '14px'}}>
                          {newAttractionData.partnerContact.phone && (
                            <p style={{margin: 0, display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
                              <span style={{fontSize: '1.1rem', width: '1.2rem'}}>📱</span>
                              {newAttractionData.partnerContact.phone}
                            </p>
                          )}
                          {newAttractionData.partnerContact.email && (
                            <p style={{margin: 0, display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
                              <span style={{fontSize: '1.1rem', width: '1.2rem'}}>📧</span>
                              {newAttractionData.partnerContact.email}
                            </p>
                          )}
                          {newAttractionData.partnerContact.website && (
                            <p style={{margin: 0, display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
                              <span style={{fontSize: '1.1rem', width: '1.2rem'}}>🌐</span>
                              <a
                                href={`https://${newAttractionData.partnerContact.website.replace(/^https?:\/\//, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{color: '#667eea', textDecoration: 'none'}}
                              >
                                {newAttractionData.partnerContact.website}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => {
                setIsAddingAttraction(false)
                setNewAttractionData(null)
                setNewAttractionImageIndex(0)
                setNewImageUrl('')
              }}>
                Отменить
              </button>
              <button className="btn-primary" onClick={() => {
                console.log('Новая достопримечательность добавлена:', newAttractionData)
                setIsAddingAttraction(false)
                setNewAttractionData(null)
                setNewAttractionImageIndex(0)
                setNewImageUrl('')
              }}>
                ✅ Создать достопримечательность
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
