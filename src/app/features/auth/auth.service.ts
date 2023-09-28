import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { createClient, SupabaseClient, User, Session, AuthChangeEvent, AuthSession } from '@supabase/supabase-js'
import { BehaviorSubject, Observable, forkJoin, from, pluck, switchMap } from 'rxjs'
import { environment } from 'src/environments/environment'
import { SigninCredentials, SignupCredentials } from './auth.model'
import { HttpClient } from '@angular/common/http'
import { Auth } from '@angular/fire/auth'


export interface Profile {
  id?: string
  displayName: string
  website: string
  avatar_url: string
}
@Injectable({
  providedIn: 'root',
})

export class AuthService {

  private supabase: SupabaseClient
  private authState: BehaviorSubject<boolean | User | any> = new BehaviorSubject(null)
    _session: AuthSession | null = null
  isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor(private router: Router, private auth: Auth, private http: HttpClient) {
    this.supabase = createClient(environment.supabase.supabaseUrl, environment.supabase.supabaseKey)

    // Manually load user session once on page load
    const user = this.supabase.auth.getUser()
    if (user) {
      this.authState.next(user)
    } else {
      this.authState.next(false)
    }

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event == 'SIGNED_IN') {
        this.authState.next(session!.user)
        this.isLoggedIn$.next(true);
      } else {
        this.authState.next(false)
        this.router.navigateByUrl('/', { replaceUrl: true })
        this.isLoggedIn$.next(false);
        
      }
    })
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  profile(user: User) {
    return this.supabase
      .from('profiles')
      .select(`displayName, website, avatar_url`)
      .eq('id', user.id)
      .single()
  }


  signUp({ email, password, displayName }: SignupCredentials) {
    return from(this.supabase.auth.signInWithPassword({email: email,password: password}))
  }
  signIn({ email, password }: SigninCredentials) {
  
    return from(this.supabase.auth.signInWithPassword({email: email,password: password}))

  }

  signOut(){
    return from(this.supabase.auth.signOut())
  }
  getCurrentUser() {
    return this.session?.user!;
  }

  get currentUser() {
    return this.authState.asObservable()
  }

  getStreamToken() {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/createStreamToken`, {
      user: this.getCurrentUser()
    }).pipe(pluck('token'))
  }

}
