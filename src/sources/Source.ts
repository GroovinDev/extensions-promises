/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */

import { SearchRequest } from "../models/SearchRequest/SearchRequest"
import { Manga } from "../models/Manga/Manga"
import { Request } from "../models/RequestObject/RequestObject"
import { Chapter } from "../models/Chapter/Chapter"
import { ChapterDetails } from "../models/ChapterDetails/ChapterDetails"
import { MangaTile } from "../models/MangaTile/MangaTile"
import { HomeSectionRequest, HomeSection } from "../models/HomeSection/HomeSection"

export abstract class Source {
  protected cheerio: CheerioAPI
  constructor(cheerio: CheerioAPI) {
    this.cheerio = cheerio
  }



  // <-----------        REQUIRED METHODS        -----------> //
  // Get information about particular manga
  abstract getMangaDetailsRequest(ids: string[]): Request[]
  abstract getMangaDetails(data: any, metadata: any): Manga[]

  // Get all chapters related to a manga
  abstract getChaptersRequest(mangaId: string): Request
  abstract getChapters(data: any, metadata: any): Chapter[]

  // Get all pages for a particular chapter
  abstract getChapterDetailsRequest(mangaId: string, chapId: string): Request
  abstract getChapterDetails(data: any, metadata: any): { 'details': ChapterDetails, 'nextPage': boolean }



  // <-----------        OPTIONAL METHODS        -----------> //
  // Determines if, and how many times, the passed in ids have been updated since reference time 
  filterUpdatedMangaRequest(ids: any, time: Date, page: number): Request | null { return null }
  filterUpdatedManga(data: any, metadata: any): { 'updatedMangaIds': string[], 'nextPage': boolean } | null { return null }

  // For the apps home page, there are multiple sections that contain manga of interest
  // Function returns formatted sections and any number of such
  getHomePageSectionRequest(): HomeSectionRequest[] | null { return null }
  getHomePageSections(data: any, section: HomeSection[]): HomeSection[] | null { return null }

  // For many of the home page sections, there is an ability to view more of that selection
  // Calling these functions will retrieve more MangaTiles for the particular section
  getViewMoreRequest(key: string): Request | null { return null }
  getViewMoreItems(data: any, key: string, page: number): MangaTile[] | null { return null }

  // Does a search request - It is capable of doing advanced searches
  // See SearchRequest interface or MangaPark implementation for more information
  searchRequest(query: SearchRequest, page: number): Request | null { return null }
  search(data: any): MangaTile[] | null { return null }



  // <-----------        PROTECTED METHODS        -----------> //
  // Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
  protected convertTime(timeAgo: string): Date {
    let time: Date
    let trimmed: number = Number((/\d*/.exec(timeAgo) ?? [])[0])
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed
    if (timeAgo.includes('minutes')) {
      time = new Date(Date.now() - trimmed * 60000)
    }
    else if (timeAgo.includes('hours')) {
      time = new Date(Date.now() - trimmed * 3600000)
    }
    else if (timeAgo.includes('days')) {
      time = new Date(Date.now() - trimmed * 86400000)
    }
    else {
      time = new Date(Date.now() - 31556952000)
    }

    return time
  }
}