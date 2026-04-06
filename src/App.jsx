import { useState } from 'react'
import { WardrobeProvider } from './context/WardrobeContext'
import HomeScreen from './components/HomeScreen'
import WardrobeList from './components/WardrobeList'
import AddItem from './components/AddItem'
import ItemDetail from './components/ItemDetail'
import CreateOutfit from './components/CreateOutfit'
import ItemPicker from './components/ItemPicker'
import SavedOutfitsList from './components/SavedOutfitsList'
import OutfitDetail from './components/OutfitDetail'

function Router() {
  const [nav, setNav] = useState({ screen: 'home', params: {} })

  function navigate(screen, params = {}) {
    setNav({ screen, params })
    window.scrollTo(0, 0)
  }

  const { screen, params } = nav

  const screens = {
    home: <HomeScreen navigate={navigate} />,
    wardrobe: <WardrobeList navigate={navigate} />,
    'add-item': <AddItem navigate={navigate} params={params} />,
    'item-detail': <ItemDetail navigate={navigate} params={params} />,
    'create-outfit': <CreateOutfit navigate={navigate} params={params} />,
    'item-picker': <ItemPicker navigate={navigate} params={params} />,
    'saved-outfits': <SavedOutfitsList navigate={navigate} />,
    'outfit-detail': <OutfitDetail navigate={navigate} params={params} />,
  }

  return screens[screen] ?? screens.home
}

export default function App() {
  return (
    <WardrobeProvider>
      <div className="min-h-screen bg-gray-50">
        <Router />
      </div>
    </WardrobeProvider>
  )
}
