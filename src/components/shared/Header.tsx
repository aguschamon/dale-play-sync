'use client'
import { Bell, Search, User, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="bg-dale-navy-light border-b border-dale-navy-lighter px-6 py-4 ml-64">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-dale-navy-lighter transition-colors duration-200">
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar oportunidades, clientes, canciones..."
              className="pl-10 pr-4 py-2 bg-dale-navy-light border border-dale-navy-lighter rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dale-purple focus:border-transparent w-96"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-lg hover:bg-dale-navy-lighter transition-colors duration-200">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-dale-red rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-gray-400">Bienvenido</div>
              <div className="text-white font-medium">Sync Manager</div>
            </div>
            <div className="w-8 h-8 bg-dale-purple rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
