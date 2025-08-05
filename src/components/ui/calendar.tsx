"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { differenceInCalendarDays } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import {
  DayPicker,
  labelNext,
  labelPrevious,
  useDayPicker,
  type DayPickerProps,
} from "react-day-picker"

export type CalendarProps = DayPickerProps & {
  yearRange?: number
  showYearSwitcher?: boolean
  monthsClassName?: string
  monthCaptionClassName?: string
  weekdaysClassName?: string
  weekdayClassName?: string
  monthClassName?: string
  captionClassName?: string
  captionLabelClassName?: string
  buttonNextClassName?: string
  buttonPreviousClassName?: string
  navClassName?: string
  monthGridClassName?: string
  weekClassName?: string
  dayClassName?: string
  dayButtonClassName?: string
  rangeStartClassName?: string
  rangeEndClassName?: string
  selectedClassName?: string
  todayClassName?: string
  outsideClassName?: string
  disabledClassName?: string
  rangeMiddleClassName?: string
  hiddenClassName?: string
  selected: Date | undefined
}

type NavView = "days" | "years" | "months"
interface CustomDayPickerContext extends ReturnType<typeof useDayPicker> {
  month: Date
}
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showYearSwitcher = true,
  yearRange = 12,
  numberOfMonths,
  ...props
}: CalendarProps) {
  const [navView, setNavView] = React.useState<NavView>("days")
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null)
  const [displayYears, setDisplayYears] = React.useState<{
    from: number
    to: number
  }>(
    React.useMemo(() => {
      const currentYear = new Date().getFullYear()
      return {
        from: currentYear - Math.floor(yearRange / 2 - 1),
        to: currentYear + Math.ceil(yearRange / 2),
      }
    }, [yearRange])
  )

  const { onNextClick, onPrevClick, startMonth, endMonth } = props

  const columnsDisplayed = navView === "years" ? 1 : numberOfMonths

  const _monthsClassName = cn("relative flex", props.monthsClassName)
  const _monthCaptionClassName = cn(
    "relative mx-10 flex h-7 items-center justify-center",
    props.monthCaptionClassName
  )
  const _weekdaysClassName = cn("flex flex-row", props.weekdaysClassName)
  const _weekdayClassName = cn(
    "w-8 text-sm font-normal text-gray-800",
    props.weekdayClassName
  )
  const _monthClassName = cn("w-full", props.monthClassName)
  const _captionClassName = cn(
    "relative flex items-center justify-center pt-1",
    props.captionClassName
  )
  const _captionLabelClassName = cn(
    "truncate text-sm font-medium text-gray-900",
    props.captionLabelClassName
  )
  const buttonNavClassName = buttonVariants({
    variant: "outline",
    className:
      "absolute h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
  })
  const _buttonNextClassName = cn(
    buttonNavClassName,
    "right-0",
    props.buttonNextClassName
  )
  const _buttonPreviousClassName = cn(
    buttonNavClassName,
    "left-0",
    props.buttonPreviousClassName
  )
  const _navClassName = cn("flex items-start text-black", props.navClassName)
  const _monthGridClassName = cn("mx-auto mt-4 text-black", props.monthGridClassName)
  const _weekClassName = cn("mt-2 flex w-max items-start text-black", props.weekClassName)
  const _dayClassName = cn(
    "flex size-8 flex-1 items-center justify-center p-0 text-sm text-black",
    props.dayClassName
  )
  const _dayButtonClassName = cn(
    buttonVariants({ variant: "ghost" }),
    "size-8 rounded-md p-0 font-normal transition-none aria-selected:opacity-100",
    props.dayButtonClassName
  )
  const _rangeStartClassName = cn(
    "bg-blue-100 [&>button]:bg-blue-600 [&>button]:text-white-100 [&>button]:hover:bg-blue-700 rounded-l-md",
    props.rangeStartClassName
  )
  const _rangeEndClassName = cn(
    "bg-blue-100 [&>button]:bg-blue-600 [&>button]:text-white-100 [&>button]:hover:bg-blue-700 rounded-r-md",
    props.rangeEndClassName
  )
  const _rangeMiddleClassName = cn(
    "bg-blue-50 text-gray-900 [&>button]:bg-transparent [&>button]:text-gray-900 [&>button]:hover:bg-transparent",
    props.rangeMiddleClassName
  )
  const _selectedClassName = cn(
    "[&>button]:bg-blue-600 [&>button]:text-white-100 [&>button]:hover:bg-blue-700",
    props.selectedClassName
  )
  const _todayClassName = cn(
    "[&>button]:bg-gray-100 [&>button]:text-gray-900",
    props.todayClassName
  )
  const _outsideClassName = cn(
    "text-gray-600 opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray-600",
    props.outsideClassName
  )
  const _disabledClassName = cn(
    "text-gray-600 opacity-50",
    props.disabledClassName
  )
  const _hiddenClassName = cn("invisible flex-1", props.hiddenClassName)

  return (
    <DayPicker
    showOutsideDays={showOutsideDays}
    defaultMonth={props.selected}
    className={cn("p-3", className)}
    style={{
      width: 248.8 * (numberOfMonths ?? 1) + "px",
    }}
      classNames={{
        months: _monthsClassName,
        month_caption: _monthCaptionClassName,
        weekdays: _weekdaysClassName,
        weekday: _weekdayClassName,
        month: _monthClassName,
        caption: _captionClassName,
        caption_label: _captionLabelClassName,
        button_next: _buttonNextClassName,
        button_previous: _buttonPreviousClassName,
        nav: _navClassName,
        month_grid: _monthGridClassName,
        week: _weekClassName,
        day: _dayClassName,
        day_button: _dayButtonClassName,
        range_start: _rangeStartClassName,
        range_middle: _rangeMiddleClassName,
        range_end: _rangeEndClassName,
        selected: _selectedClassName,
        today: _todayClassName,
        outside: _outsideClassName,
        disabled: _disabledClassName,
        hidden: _hiddenClassName,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" />
        },
        Nav: ({ className }) => (
          <Nav
            className={className}
            displayYears={displayYears}
            navView={navView}
            setDisplayYears={setDisplayYears}
            startMonth={startMonth}
            endMonth={endMonth}
            onPrevClick={onPrevClick}
          />
        ),
        CaptionLabel: (props) => (
          <CaptionLabel
            showYearSwitcher={showYearSwitcher}
            navView={navView}
            setNavView={setNavView}
            displayYears={displayYears}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            {...props}
          />
        ),
        MonthGrid: ({ className, children, ...props }) => (
          <MonthGrid
            className={className}
            displayYears={displayYears}
            startMonth={startMonth}
            endMonth={endMonth}
            navView={navView}
            setNavView={setNavView}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            {...props}
          >
            {children}
          </MonthGrid>
        ),
      }}
      numberOfMonths={columnsDisplayed}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

function Nav({
  className,
  navView,
  startMonth,
  endMonth,
  displayYears,
  setDisplayYears,
  onPrevClick,
  onNextClick,
}: {
  className?: string
  navView: NavView
  startMonth?: Date
  endMonth?: Date
  displayYears: { from: number; to: number }
  setDisplayYears: React.Dispatch<
    React.SetStateAction<{ from: number; to: number }>
  >
  onPrevClick?: (date: Date) => void
  onNextClick?: (date: Date) => void
}) {
  const { nextMonth, previousMonth, goToMonth } = useDayPicker()

  const isPreviousDisabled = (() => {
    if (navView === "years") {
      return (
        (startMonth &&
          differenceInCalendarDays(
            new Date(displayYears.from - 1, 0, 1),
            startMonth
          ) < 0) ||
        (endMonth &&
          differenceInCalendarDays(
            new Date(displayYears.from - 1, 0, 1),
            endMonth
          ) > 0)
      )
    }
    return !previousMonth
  })()

  const isNextDisabled = (() => {
    if (navView === "years") {
      return (
        (startMonth &&
          differenceInCalendarDays(
            new Date(displayYears.to + 1, 0, 1),
            startMonth
          ) < 0) ||
        (endMonth &&
          differenceInCalendarDays(
            new Date(displayYears.to + 1, 0, 1),
            endMonth
          ) > 0)
      )
    }
    return !nextMonth
  })()

  const handlePreviousClick = React.useCallback(() => {
    if (!previousMonth) return
    if (navView === "years") {
      setDisplayYears((prev) => ({
        from: prev.from - (prev.to - prev.from + 1),
        to: prev.to - (prev.to - prev.from + 1),
      }))
      onPrevClick?.(
        new Date(
          displayYears.from - (displayYears.to - displayYears.from),
          0,
          1
        )
      )
      return
    }
    goToMonth(previousMonth)
    onPrevClick?.(previousMonth)
  }, [previousMonth, goToMonth])

  const handleNextClick = React.useCallback(() => {
    if (!nextMonth) return
    if (navView === "years") {
      setDisplayYears((prev) => ({
        from: prev.from + (prev.to - prev.from + 1),
        to: prev.to + (prev.to - prev.from + 1),
      }))
      onNextClick?.(
        new Date(
          displayYears.from + (displayYears.to - displayYears.from),
          0,
          1
        )
      )
      return
    }
    goToMonth(nextMonth)
    onNextClick?.(nextMonth)
  }, [goToMonth, nextMonth])
  return (
    <nav className={cn("flex items-center", className)}>
      <Button
        variant="outline"
        className="absolute left-0 h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
        type="button"
        tabIndex={isPreviousDisabled ? undefined : -1}
        disabled={isPreviousDisabled}
        aria-label={
          navView === "years"
            ? `Go to the previous ${
                displayYears.to - displayYears.from + 1
              } years`
            : labelPrevious(previousMonth)
        }
        onClick={handlePreviousClick}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        className="absolute right-0 h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
        type="button"
        tabIndex={isNextDisabled ? undefined : -1}
        disabled={isNextDisabled}
        aria-label={
          navView === "years"
            ? `Go to the next ${displayYears.to - displayYears.from + 1} years`
            : labelNext(nextMonth)
        }
        onClick={handleNextClick}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
function CaptionLabel({
  children,
  showYearSwitcher,
  navView,
  setNavView,
  displayYears,
  selectedYear,
  setSelectedYear,
  ...props
}: {
  showYearSwitcher?: boolean
  navView: NavView
  setNavView: React.Dispatch<React.SetStateAction<NavView>>
  displayYears: { from: number; to: number }
  selectedYear: number | null
  setSelectedYear: React.Dispatch<React.SetStateAction<number | null>>
} & React.HTMLAttributes<HTMLSpanElement>) {
  const { goToMonth, month } = useDayPicker() as CustomDayPickerContext

  const handleClick = () => {
    if (!showYearSwitcher) return
    
    if (navView === "days") {
      setNavView("years")
    } else if (navView === "months") {
      setNavView("days")
      setSelectedYear(null)
    }
  }

  return (
    <Button
      className="h-7 w-full truncate text-sm font-medium text-black hover:text-black"
      variant="ghost"
      size="sm"
      onClick={handleClick}
    >
      {navView === "days" && children}
      {navView === "years" && `${displayYears.from} - ${displayYears.to}`}
      {navView === "months" && `${selectedYear}`}
    </Button>
  )
}

function MonthGrid({
  className,
  children,
  displayYears,
  startMonth,
  endMonth,
  navView,
  setNavView,
  selectedYear,
  setSelectedYear,
  ...props
}: {
  className?: string
  children: React.ReactNode
  displayYears: { from: number; to: number }
  startMonth?: Date
  endMonth?: Date
  navView: NavView
  setNavView: React.Dispatch<React.SetStateAction<NavView>>
  selectedYear: number | null
  setSelectedYear: React.Dispatch<React.SetStateAction<number | null>>
} & React.TableHTMLAttributes<HTMLTableElement>) {
  if (navView === "years") {
    return (
      <YearGrid
        displayYears={displayYears}
        startMonth={startMonth}
        endMonth={endMonth}
        setNavView={setNavView}
        setSelectedYear={setSelectedYear}
        navView={navView}
        className={className}
        {...props}
      />
    )
  }
  if (navView === "months" && selectedYear) {
    return (
      <MonthSelector
        year={selectedYear}
        startMonth={startMonth}
        endMonth={endMonth}
        setNavView={setNavView}
        className={className}
        {...props}
      />
    )
  }
  return (
    <table className={className} {...props}>
      {children}
    </table>
  )
}

function YearGrid({
  className,
  displayYears,
  startMonth,
  endMonth,
  setNavView,
  setSelectedYear,
  navView,
}: {
  className?: string
  displayYears: { from: number; to: number }
  startMonth?: Date
  endMonth?: Date
  setNavView: React.Dispatch<React.SetStateAction<NavView>>
  setSelectedYear: React.Dispatch<React.SetStateAction<number | null>>
  navView: NavView
} & React.HTMLAttributes<HTMLDivElement>) {
  const { goToMonth, selected } = useDayPicker()

  return (
    <div className={cn("grid grid-cols-4 gap-y-2", className)}>
      {Array.from(
        { length: displayYears.to - displayYears.from + 1 },
        (_, i) => {
          const year = displayYears.from + i
          const isBefore = startMonth && year < startMonth.getFullYear()
          const isAfter = endMonth && year > endMonth.getFullYear()
          const isDisabled = isBefore || isAfter

          return (
            <Button
              key={i}
              className={cn(
                "h-7 w-full text-sm font-normal text-foreground",
                year === new Date().getFullYear() &&
                  "bg-accent font-medium text-accent-foreground"
              )}
              variant="ghost"
              onClick={() => {
                setNavView("months")
                setSelectedYear(year)
              }}
              disabled={isDisabled}
            >
              {year}
            </Button>
          )
        }
      )}
    </div>
  )
}

function MonthSelector({
  className,
  year,
  startMonth,
  endMonth,
  setNavView,
}: {
  className?: string
  year: number
  startMonth?: Date
  endMonth?: Date
  setNavView: React.Dispatch<React.SetStateAction<NavView>>
} & React.HTMLAttributes<HTMLDivElement>) {
  const { goToMonth, selected } = useDayPicker()
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  return (
    <div className={cn("grid grid-cols-4 gap-y-2", className)}>
      {months.map((month, index) => {
        const monthDate = new Date(year, index, 1)
        const isBefore = startMonth && monthDate < startMonth
        const isAfter = endMonth && monthDate > endMonth
        const isDisabled = isBefore || isAfter

        return (
          <Button
            key={month}
            className={cn(
              "h-7 w-full text-sm font-normal text-foreground",
              monthDate.getMonth() === new Date().getMonth() &&
                year === new Date().getFullYear() &&
                "bg-accent font-medium text-accent-foreground"
            )}
            variant="ghost"
            onClick={() => {
              setNavView("days")
              goToMonth(new Date(year, index, 1))
            }}
            disabled={isDisabled}
          >
            {month}
          </Button>
        )
      })}
    </div>
  )
}

export { Calendar }