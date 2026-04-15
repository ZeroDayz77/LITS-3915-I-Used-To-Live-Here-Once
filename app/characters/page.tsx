import styles from "./character.module.css";
export default function CharactersPage() { 
  return ( 
    <main className="content-page characters-page"> 
      <section className="content-hero"> 
        <p className="content-kicker">Character Study</p>
        <h1>Unseen and Unheard</h1>
        <p> 
          The characters in this story are defined by their relationship to memory, presence, and identity.
        </p> 
      </section> 
      
      <section className={styles.contentCardGrid}> 
        <article className={`${styles.charInfo} ${styles.returningWomanCard}`}> 
          <div className={styles.newspaperImage} aria-hidden="true" />
          <h2>The Returning Woman</h2> 
          <p className={styles.char}> The central figure is unnamed, which helps her become both individual and symbolic. She carries memory, longing, and disbelief as she revisits what once defined home. </p> 
          
          <h3>Identity and Presence</h3> 
          <p> She experiences the place as if she belongs to it, yet the living world does not recognize her. This creates tension between self-perception and social visibility. </p>
          
          <h3>Visual Representation</h3> 
          <p> A faded silhouette, translucent figure, or distant ghostly form can represent her. Use framing that keeps her near familiar spaces while still visually separated from them. </p> 
          
          <h3>Sound Design Direction</h3> 
          <p> Light wind, rustling leaves, and flowing water can heighten unease. Ambient audio should feel natural at first, then gradually become hollow and colder as she reaches the house. </p> 
        </article>

        <article className={styles.charInfo}> 
          <h2>The Unknowing Children</h2> 
          <p className={styles.char}> Two minor characters united as one enity that is meant to act as the mirror refelcting The Returning Woman's death and ultimately her into the realization that she has passed away.</p> 
          
          <h3>Identity and Presence</h3> 
          <p> The children represent the living world, their identity rooted in visibility and mutual recognition. Their presence contrasts with the returning woman’s invisibility, emphasizing the divide between those who exist within life and those who do not.</p>
          
          <h3>Visual Representation</h3> 
          <p>Two young, fair-skinned European children of similar age bring a childlike innocence to the narrative, countering its darker themes of death and colonization. </p> 
          
          <h3>Symbolism</h3> 
          <p>The children symbolise innocence and normalcy within the living world, their unawareness reinforcing the boundary between presence and absence. Their behaviour reflects the natural acceptance of life that excludes the returning woman. </p> 
        </article>
      </section> 
    </main> 
  ); 
}
