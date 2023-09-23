import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { BehaviorSubject, forkJoin, from, switchMap } from 'rxjs'
import { environment } from 'src/environments/environment'
import { SigninCredentials, SignupCredentials } from './auth.model'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient
  private _currentUser: BehaviorSubject<boolean | User | any> = new BehaviorSubject(null)

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabase.supabaseUrl, environment.supabase.supabaseKey)

    // Manually load user session once on page load
    const user = this.supabase.auth.getUser()
    if (user) {
      this._currentUser.next(user)
    } else {
      this._currentUser.next(false)
    }

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event == 'SIGNED_IN') {
        this._currentUser.next(session!.user)
      } else {
        this._currentUser.next(false)
        this.router.navigateByUrl('/', { replaceUrl: true })
      }
    })
  }

  signUp({ email, password, displayName }: SignupCredentials) {
    return from(this.supabase.auth.signInWithPassword({email: email,password: password}))
  }
  signIn({ email, password }: SigninCredentials) {
  
    return this.supabase.auth.signInWithPassword({email: email,password: password})
  }

  signOut() {
    this.supabase.auth.signOut()
  }

  get currentUser() {
    return this._currentUser.asObservable()
  }
}
