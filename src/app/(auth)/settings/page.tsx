'use client'
import { useState } from 'react'
import { Settings, Palette, Bell, User, Database, Save, Moon, Sun, Smartphone, Monitor } from 'lucide-react'

export default function SettingsPage() {
  const [theme, setTheme] = useState('dark')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  })
  const [userSettings, setUserSettings] = useState({
    language: 'es',
    timezone: 'America/Argentina/Buenos_Aires',
    dateFormat: 'DD/MM/YYYY'
  })

  const handleSave = () => {
    // Aquí se guardarían las configuraciones
    console.log('Guardando configuraciones...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Configuración</h1>
          <p className="text-gray-400 mt-2">Personaliza tu experiencia en Dale Play Sync Center</p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tema */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-dale-purple bg-opacity-20 rounded-lg">
              <Palette className="w-5 h-5 text-dale-purple" />
            </div>
            <h3 className="text-lg font-semibold text-white">Tema y Colores</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tema Principal
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'border-dale-purple bg-dale-purple bg-opacity-20 text-dale-purple' 
                      : 'border-dale-navy-lighter text-gray-400 hover:border-dale-purple'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Oscuro</span>
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'light' 
                      ? 'border-dale-purple bg-dale-purple bg-opacity-20 text-dale-purple' 
                      : 'border-dale-navy-lighter text-gray-400 hover:border-dale-purple'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Claro</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Esquema de Colores
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-dale-navy-light border-2 border-dale-purple rounded-lg cursor-pointer">
                  <div className="w-full h-8 bg-gradient-to-r from-dale-navy to-dale-purple rounded mb-2"></div>
                  <span className="text-xs text-gray-400">Malbec</span>
                </div>
                <div className="p-3 bg-dale-navy-light border-2 border-transparent rounded-lg cursor-pointer hover:border-dale-navy-lighter">
                  <div className="w-full h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded mb-2"></div>
                  <span className="text-xs text-gray-400">Azul</span>
                </div>
                <div className="p-3 bg-dale-navy-light border-2 border-transparent rounded-lg cursor-pointer hover:border-dale-navy-lighter">
                  <div className="w-full h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded mb-2"></div>
                  <span className="text-xs text-gray-400">Verde</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-dale-emerald bg-opacity-20 rounded-lg">
              <Bell className="w-5 h-5 text-dale-emerald" />
            </div>
            <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Notificaciones por Email</label>
                <p className="text-xs text-gray-500">Recibe alertas importantes por correo</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dale-navy-lighter peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dale-emerald"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Notificaciones Push</label>
                <p className="text-xs text-gray-500">Alertas en tiempo real en el navegador</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dale-navy-lighter peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dale-emerald"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">Notificaciones SMS</label>
                <p className="text-xs text-gray-500">Alertas críticas por mensaje de texto</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dale-navy-lighter peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dale-emerald"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Usuario */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-dale-blue bg-opacity-20 rounded-lg">
              <User className="w-5 h-5 text-dale-blue" />
            </div>
            <h3 className="text-lg font-semibold text-white">Preferencias de Usuario</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Idioma
              </label>
              <select
                value={userSettings.language}
                onChange={(e) => setUserSettings({...userSettings, language: e.target.value})}
                className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zona Horaria
              </label>
              <select
                value={userSettings.timezone}
                onChange={(e) => setUserSettings({...userSettings, timezone: e.target.value})}
                className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
              >
                <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Formato de Fecha
              </label>
              <select
                value={userSettings.dateFormat}
                onChange={(e) => setUserSettings({...userSettings, dateFormat: e.target.value})}
                className="w-full bg-dale-navy-light border border-dale-navy-lighter rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-dale-purple"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Base de Datos */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-dale-amber bg-opacity-20 rounded-lg">
              <Database className="w-5 h-5 text-dale-amber" />
            </div>
            <h3 className="text-lg font-semibold text-white">Base de Datos</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-dale-navy-lighter rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Estado de la BD</span>
                <span className="text-xs text-dale-emerald bg-dale-emerald bg-opacity-20 px-2 py-1 rounded-full">Conectada</span>
              </div>
              <p className="text-xs text-gray-500">SQLite - Desarrollo Local</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-dale-navy-lighter rounded-lg">
                <div className="text-2xl font-bold text-dale-emerald">12</div>
                <div className="text-xs text-gray-400">Oportunidades</div>
              </div>
              <div className="text-center p-3 bg-dale-navy-lighter rounded-lg">
                <div className="text-2xl font-bold text-dale-blue">15</div>
                <div className="text-xs text-gray-400">Obras</div>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full btn-secondary text-sm">
                Respaldar Base de Datos
              </button>
              <button className="w-full btn-secondary text-sm">
                Restaurar Base de Datos
              </button>
              <button className="w-full btn-secondary text-sm">
                Limpiar Cache
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-dale-indigo bg-opacity-20 rounded-lg">
            <Smartphone className="w-5 h-5 text-dale-indigo" />
          </div>
          <h3 className="text-lg font-semibold text-white">Configuración Responsive</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-dale-navy-lighter rounded-lg">
            <Monitor className="w-8 h-8 text-dale-purple mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">Desktop</h4>
            <p className="text-xs text-gray-400">Vista completa con todas las funciones</p>
          </div>
          <div className="text-center p-4 bg-dale-navy-lighter rounded-lg">
            <Smartphone className="w-8 h-8 text-dale-blue mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">Móvil</h4>
            <p className="text-xs text-gray-400">Optimizado para pantallas pequeñas</p>
          </div>
          <div className="text-center p-4 bg-dale-navy-lighter rounded-lg">
            <Settings className="w-8 h-8 text-dale-emerald mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">Adaptativo</h4>
            <p className="text-xs text-gray-400">Se ajusta automáticamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}

