export interface School {
  id: string
  npsn: string
  school_name: string
  jenjang: 'SD' | 'SMP' | 'SMA' | 'SMK'
  kecamatan: string
  kelurahan: string
  address: string
  latitude: number
  longitude: number
  total_students: number
  total_teachers: number
  student_kip_count: number
}

export interface SchoolIndex {
  id: string
  school_id: string
  sigapp_index: number
  p1_quality_gap: number
  p2_spatial_inequity: number
  p3_structural_risk: number
  p4_public_signal: number
  priority_tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  notes: string | null
  computed_at: string
}

export interface PillarVariables {
  id: string
  school_id: string
  literacy_score: number
  numeracy_score: number
  teacher_quality_score: number
  poverty_rate: number
  travel_time_minutes: number
  building_damage_weight: number
  enrollment_trend_3yr: number
  complaint_frequency: number
}

export interface SchoolWithIndex extends School {
  school_index: SchoolIndex
}

export interface SchoolDetail extends School {
  school_index: SchoolIndex
  pillar_variables: PillarVariables
}
