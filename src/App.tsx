import { BoxSection, QueueSection } from './components'

function App() {
  return (
    <div className="h-screen bg-gray-100 p-4 ipad-landscape:p-6">
      <div className="h-full max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Chouette Scoreboard
          </h1>
        </header>
        
        <div className="grid grid-cols-1 ipad-landscape:grid-cols-3 gap-6 h-5/6">
          <div className="ipad-landscape:col-span-2">
            <BoxSection className="h-full" />
          </div>
          
          <div className="ipad-landscape:col-span-1">
            <QueueSection className="h-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
