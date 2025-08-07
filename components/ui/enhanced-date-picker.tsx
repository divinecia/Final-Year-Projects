import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minYear?: number
  maxYear?: number
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function EnhancedDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  minYear = 1950,
  maxYear = new Date().getFullYear()
}: DatePickerProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    value ? value.getMonth() : new Date().getMonth()
  )
  const [selectedYear, setSelectedYear] = React.useState<number>(
    value ? value.getFullYear() : 2007
  )
  const [isOpen, setIsOpen] = React.useState(false)

  // Generate years array (recent years first for easier selection)
  const years = React.useMemo(() => {
    const yearsList = []
    for (let year = maxYear; year >= minYear; year--) {
      yearsList.push(year)
    }
    return yearsList
  }, [minYear, maxYear])

  // Generate days for the selected month and year
  const daysInMonth = React.useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate()
  }, [selectedMonth, selectedYear])

  const days = React.useMemo(() => {
    const daysList = []
    for (let day = 1; day <= daysInMonth; day++) {
      daysList.push(day)
    }
    return daysList
  }, [daysInMonth])

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedYear, selectedMonth, day)
    onChange?.(newDate)
    setIsOpen(false)
  }

  const handleMonthChange = (month: string) => {
    const monthIndex = months.indexOf(month)
    setSelectedMonth(monthIndex)
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11)
        setSelectedYear(prev => prev - 1)
      } else {
        setSelectedMonth(prev => prev - 1)
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0)
        setSelectedYear(prev => prev + 1)
      } else {
        setSelectedMonth(prev => prev + 1)
      }
    }
  }

  React.useEffect(() => {
    if (value) {
      setSelectedMonth(value.getMonth())
      setSelectedYear(value.getFullYear())
    }
  }, [value])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          {/* Month and Year Selectors */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={selectedYear <= minYear && selectedMonth === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-2 flex-1">
              <Select value={months[selectedMonth]} onValueChange={handleMonthChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={selectedYear >= maxYear && selectedMonth === 11}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-muted-foreground font-medium">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, index) => (
              <div key={index} className="p-2"></div>
            ))}
            
            {/* Days of the month */}
            {days.map((day) => {
              const isSelected = value && 
                value.getDate() === day && 
                value.getMonth() === selectedMonth && 
                value.getFullYear() === selectedYear
              const isToday = 
                new Date().getDate() === day && 
                new Date().getMonth() === selectedMonth && 
                new Date().getFullYear() === selectedYear
              
              return (
                <Button
                  key={day}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 w-9 p-0 font-normal",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    isToday && !isSelected && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleDateSelect(day)}
                >
                  {day}
                </Button>
              )
            })}
          </div>
          
          {/* Quick year selection for birth years */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-2">Quick birth year selection:</div>
            <div className="flex flex-wrap gap-1">
              {[2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000].map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
