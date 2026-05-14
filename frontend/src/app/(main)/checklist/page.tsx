'use client';

import React, { useState, useEffect } from 'react';
import styles from './checklist.module.css';

interface Tag {
  text: string;
  type: 'req' | 'opt' | 'np' | 'nor';
}

interface ChecklistItem {
  id: string;
  text: string;
  note?: string;
  tags?: Tag[];
  checked?: boolean;
}

interface Section {
  label: string;
  items: ChecklistItem[];
}

interface Phase {
  id: string;
  title: string;
  description: string;
  badge: string;
  info?: string;
  warn?: string;
  sections: Section[];
}

interface ChecklistData {
  phases: Phase[];
}

export default function ChecklistPage() {
  const [data, setData] = useState<ChecklistData | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch checklist structure from backend
    const fetchChecklist = async () => {
      try {
        const response = await fetch('/api/v1/checklist/');
        const checklists = await response.json();
        if (checklists && checklists.length > 0) {
          // Use the first checklist for now
          setData(checklists[0].data);
        }
      } catch (error) {
        console.error('Failed to fetch checklist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();

    // Load checked state from localStorage
    const saved = localStorage.getItem('norway_checklist_progress');
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(checkedItems).length > 0) {
      localStorage.setItem('norway_checklist_progress', JSON.stringify(checkedItems));
    }
  }, [checkedItems]);

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const togglePhase = (phaseId: string) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const resetAll = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      setCheckedItems({});
      localStorage.removeItem('norway_checklist_progress');
    }
  };

  if (loading) return <div className={styles.container}>Loading checklist...</div>;
  if (!data) return <div className={styles.container}>Checklist not found.</div>;

  // Calculate progress
  const allItems = data.phases.flatMap(p => p.sections.flatMap(s => s.items));
  const total = allItems.length;
  const done = allItems.filter(item => checkedItems[item.text]).length; // Using text as ID since I didn't generate UUIDs for items in JSON
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className={styles.pageBody}>
      <div className={styles.header}>
        <div className={styles.flagStripe}>
          <div className={styles.flagNp}></div>
          <span style={{ color: '#4a5680', fontSize: '18px', margin: '0 4px' }}>→</span>
          <div className={styles.flagCross}></div>
          <span className={styles.routeLabel}>Nepal → Oslo, Norway</span>
        </div>
        <h1 className={styles.headerTitle}>Masters Application<br /><span>Document Checklist</span></h1>
        <p className={styles.headerDesc}>Complete step-by-step checklist from university application through document attestation in Nepal to VFS Global submission for Norway student residence permit.</p>
      </div>

      <div className={styles.progressWrap}>
        <span className={styles.progressLabel}>Overall Progress</span>
        <div className={styles.progressBarBg}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${pct}%` }}
          ></div>
        </div>
        <span className={styles.progressCount}>{done} / {total} done</span>
        <button className={styles.resetBtn} onClick={resetAll}>Reset All</button>
      </div>

      <div className={styles.container}>
        {/* TIMELINE */}
        <div className={styles.timeline}>
          {data.phases.map((phase, index) => (
            <div key={phase.id} className={styles.tlStep}>
              <span>Phase {index + 1}</span>
              {phase.title.split('—')[0].split('(')[0]}
            </div>
          ))}
        </div>

        {/* PHASES */}
        {data.phases.map((phase, index) => (
          <div 
            key={phase.id} 
            className={`${styles.phase} ${styles[`phase-${index + 1}`]} ${collapsedPhases[phase.id] ? styles.collapsed : ''}`}
          >
            <div className={styles.phaseHeader} onClick={() => togglePhase(phase.id)}>
              <div className={styles.phaseNum}>{index + 1}</div>
              <div className={styles.phaseTitle}>
                <h2>{phase.title}</h2>
                <p>{phase.description}</p>
              </div>
              <span className={styles.phaseBadge}>{phase.badge}</span>
              <span className={styles.phaseChevron}>▼</span>
            </div>
            <div className={styles.phaseBody}>
              {phase.info && <div className={styles.infoBox} dangerouslySetInnerHTML={{ __html: phase.info }}></div>}
              {phase.warn && <div className={styles.warnBox} dangerouslySetInnerHTML={{ __html: phase.warn }}></div>}

              {phase.sections.map((section, sIndex) => (
                <div key={sIndex}>
                  <div className={styles.sectionLabel}>{section.label}</div>
                  {section.items.map((item, iIndex) => (
                    <div 
                      key={iIndex} 
                      className={`${styles.item} ${checkedItems[item.text] ? styles.checked : ''}`}
                      onClick={() => toggleItem(item.text)}
                    >
                      <div className={styles.checkbox}>
                        <span className={styles.checkmark}>✓</span>
                      </div>
                      <div className={styles.itemContent}>
                        <div className={styles.itemText}>
                          {item.text}
                          {item.tags?.map((tag, tIndex) => (
                            <span key={tIndex} className={`${styles.tag} ${styles[`tag-${tag.type}`]}`}>
                              {tag.text}
                            </span>
                          ))}
                        </div>
                        {item.note && <div className={styles.itemNote} dangerouslySetInnerHTML={{ __html: item.note }}></div>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.footer}>
          <p>Sources: <a href="https://www.udi.no/en/want-to-apply/studies/" target="_blank" rel="noreferrer">UDI Norway</a> · <a href="https://visa.vfsglobal.com/npl/en/nor/" target="_blank" rel="noreferrer">VFS Global Nepal–Norway</a> · <a href="https://studyinnorway.no" target="_blank" rel="noreferrer">Study in Norway</a> · <a href="https://www.uio.no/english/studies/admission/" target="_blank" rel="noreferrer">University of Oslo Admissions</a></p>
          <p style={{ marginTop: '6px' }}>This checklist is for guidance only. Always verify current requirements on official UDI and university websites. Requirements may change.</p>
        </div>
      </div>
    </div>
  );
}
