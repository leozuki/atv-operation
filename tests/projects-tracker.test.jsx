// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectsTracker from '../src/components/ProjectsTracker.jsx'
import { initialProjects } from '../src/data/initialData.js'

const setup = (projects = initialProjects) => {
  const setProjects = vi.fn()
  render(<ProjectsTracker projects={projects} setProjects={setProjects} onNavigateToChecklist={vi.fn()} />)
  return { setProjects }
}

const shownCount = () => Number(screen.getByText(/^\d+ Dự án$/).textContent.match(/\d+/)[0])
const search = (text) =>
  fireEvent.change(screen.getByPlaceholderText(/Tìm theo tên dự án/), { target: { value: text } })
const selectByOption = (optionLabel, value) =>
  fireEvent.change(screen.getByRole('option', { name: optionLabel }).closest('select'), { target: { value } })

describe('ProjectsTracker filters', () => {
  it('shows every project initially', () => {
    setup()
    expect(shownCount()).toBe(initialProjects.length)
  })

  it('searches by project name, case-insensitively', () => {
    setup()
    search('chateau')
    expect(shownCount()).toBe(1)
    expect(screen.getAllByText('Chateau Villa Phú Mỹ Hưng').length).toBeGreaterThan(0)
  })

  it('searches by contract code', () => {
    setup()
    search(initialProjects[0].contractCode)
    expect(shownCount()).toBe(1)
  })

  it('shows zero results for an unknown term', () => {
    setup()
    search('khong-ton-tai-xyz')
    expect(shownCount()).toBe(0)
  })

  it.each(['HCM', 'HN'])('filters by region %s', (region) => {
    setup()
    selectByOption('Tất cả Khu vực', region)
    expect(shownCount()).toBe(initialProjects.filter((p) => p.region === region).length)
  })

  it('filters by stage', () => {
    setup()
    selectByOption('Tất cả Giai đoạn', 'installation')
    expect(shownCount()).toBe(initialProjects.filter((p) => p.stage === 'installation').length)
  })

  it('combines search and region filters', () => {
    setup()
    selectByOption('Tất cả Khu vực', 'HN')
    search('chateau') // Chateau Villa is in HCM
    expect(shownCount()).toBe(0)
  })
})
